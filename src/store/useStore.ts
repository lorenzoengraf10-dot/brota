import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { DEMO_MODE } from '@/lib/demo'
import { buildDemoSeed } from '@/lib/demoData'
import type {
  AppUser,
  Business,
  Product,
  CustomerGroup,
  Customer,
  Order,
  OrderItem,
  Expense,
  SocialMetric,
  Appointment,
  Notification,
  Plan,
} from '@/types'

// ─────────────────────────────────────────────
// Helpers camelCase ⇔ snake_case
// ─────────────────────────────────────────────
function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/([A-Z])/g, '_$1').toLowerCase()] = v
  }
  return out
}

function toCamel<T>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] = v
  }
  return out as T
}

function mapRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => toCamel<T>(r))
}

function uid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

// fallback: sin conexión no degradamos el plan (un Pro offline sigue Pro)
async function fetchPlan(
  userId: string,
  fallback: Plan = 'free'
): Promise<{ plan: Plan; isFounder: boolean }> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('plan, is_founder')
    .eq('user_id', userId)
    .single()
  if (data) {
    const row = data as { plan?: string; is_founder?: boolean }
    return { plan: (row.plan as Plan) ?? 'free', isFounder: row.is_founder ?? false }
  }
  // PGRST116 = fila inexistente (usuario sin plan) → free real
  if (error?.code === 'PGRST116') return { plan: 'free', isFounder: false }
  return { plan: fallback, isFounder: false }
}

function applyDarkMode(mode: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else if (mode === 'light') root.classList.remove('dark')
  else {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', dark)
  }
}

// Error de red (no de datos): la operación debe reintentarse más tarde
function isNetworkError(err: { message?: string; code?: string } | null): boolean {
  if (!navigator.onLine) return true
  const msg = err?.message ?? ''
  return /fetch|network|timeout|abort/i.test(msg)
}

// ─────────────────────────────────────────────
// View type
// ─────────────────────────────────────────────
export type View =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'customers'
  | 'groups'
  | 'social'
  | 'expenses'
  | 'calendar'
  | 'settings'
  | 'landing'
  | 'privacy'
  | 'terms'

// ─────────────────────────────────────────────
// Cola offline: cada mutación local encola su operación remota.
// Se sincroniza al reconectar; upsert con id de cliente = reintentable.
// ─────────────────────────────────────────────
export type PendingOp =
  | { kind: 'upsert'; table: string; row: Record<string, unknown> }
  | { kind: 'delete'; table: string; id: string }

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
interface StoreState {
  // Auth
  user: AppUser | null
  loadingAuth: boolean

  // Business
  business: Business | null
  businesses: Business[]
  activeBusinessId: string | null

  // Data
  products: Product[]
  customers: Customer[]
  customerGroups: CustomerGroup[]
  orders: Order[]
  expenses: Expense[]
  socialMetrics: SocialMetric[]
  appointments: Appointment[]
  dataLoading: boolean

  // Offline
  online: boolean
  pendingOps: PendingOp[]
  syncing: boolean

  // UI
  currentView: View
  notifications: Notification[]
  darkMode: 'light' | 'dark' | 'system'
  cookieConsent: boolean | null
  onboardingDone: boolean
  landingSeen: boolean

  // Demo (datos de ejemplo, sin registro ni backend)
  demoMode: boolean
  enterDemo: () => void
  exitDemo: () => void

  // Auth
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  refreshPlan: () => Promise<void>

  // Offline
  setOnline: (v: boolean) => void
  enqueue: (op: PendingOp) => void
  flushQueue: () => Promise<void>

  // Bootstrap
  ensureBusiness: (userId: string) => Promise<Business>
  updateBusiness: (id: string, data: Partial<Business>) => Promise<void>
  addBusiness: (name: string) => Promise<void>
  switchBusiness: (id: string) => Promise<void>
  fetchAll: (businessId: string) => Promise<void>

  // Products
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>

  // Groups
  addGroup: (g: Omit<CustomerGroup, 'id' | 'createdAt'>) => Promise<void>
  updateGroup: (id: string, g: Partial<CustomerGroup>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>

  // Orders
  applyStock: (items: OrderItem[], sign: 1 | -1) => Promise<void>
  addOrder: (o: Omit<Order, 'id' | 'createdAt'>) => Promise<void>
  updateOrder: (id: string, o: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>

  // Expenses
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  // Social metrics
  upsertMetric: (m: Omit<SocialMetric, 'id' | 'createdAt'>) => Promise<void>
  deleteMetric: (id: string) => Promise<void>

  // Appointments
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>
  updateAppointment: (id: string, a: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>

  // UI
  setView: (v: View) => void
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  setDarkMode: (mode: 'light' | 'dark' | 'system') => void
  setCookieConsent: (v: boolean) => void
  resetCookieConsent: () => void
  completeOnboarding: () => void
  setLandingSeen: () => void
}

const EMPTY_DATA = {
  business: null,
  businesses: [] as Business[],
  activeBusinessId: null,
  products: [] as Product[],
  customers: [] as Customer[],
  customerGroups: [] as CustomerGroup[],
  orders: [] as Order[],
  expenses: [] as Expense[],
  socialMetrics: [] as SocialMetric[],
  appointments: [] as Appointment[],
  pendingOps: [] as PendingOp[],
}

// Estado de la demo (datos de ejemplo, sin backend). Lo comparten el arranque
// por env (VITE_DEMO_MODE) y el botón "Ver demo" de la landing.
function demoDataPatch() {
  const seed = buildDemoSeed()
  return {
    loadingAuth: false,
    demoMode: true,
    user: seed.user,
    business: seed.business,
    businesses: [seed.business],
    activeBusinessId: seed.business.id,
    products: seed.products,
    customers: seed.customers,
    customerGroups: seed.customerGroups,
    orders: seed.orders,
    expenses: seed.expenses,
    socialMetrics: seed.socialMetrics,
    appointments: seed.appointments,
    onboardingDone: true,
    landingSeen: true,
  }
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      loadingAuth: true,
      demoMode: DEMO_MODE,
      business: null,
      businesses: [],
      activeBusinessId: null,
      products: [],
      customers: [],
      customerGroups: [],
      orders: [],
      expenses: [],
      socialMetrics: [],
      appointments: [],
      dataLoading: false,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingOps: [],
      syncing: false,
      currentView: 'dashboard',
      notifications: [],
      darkMode: 'system',
      cookieConsent: null,
      onboardingDone: false,
      landingSeen: false,

      // ── offline ───────────────────────────────────
      setOnline: (v) => {
        set({ online: v })
        if (v) void get().flushQueue()
      },

      enqueue: (op) => {
        // Modo demo: los cambios quedan solo en memoria/localStorage,
        // nunca se sincronizan a ningún backend.
        if (DEMO_MODE || get().demoMode) return
        set((s) => {
          let queue = s.pendingOps
          if (op.kind === 'upsert') {
            // Coalescing: solo importa el último estado de cada fila
            queue = queue.filter(
              (q) => !(q.kind === 'upsert' && q.table === op.table && q.row.id === op.row.id)
            )
          } else {
            // Un delete anula los upserts pendientes de esa fila
            queue = queue.filter(
              (q) => !(q.kind === 'upsert' && q.table === op.table && q.row.id === op.id)
            )
          }
          return { pendingOps: [...queue, op] }
        })
        void get().flushQueue()
      },

      flushQueue: async () => {
        if (get().syncing || !navigator.onLine) return
        set({ syncing: true })
        let rejected = 0
        try {
          while (get().pendingOps.length > 0) {
            const op = get().pendingOps[0]
            const { error } =
              op.kind === 'upsert'
                ? await supabase.from(op.table).upsert(op.row)
                : await supabase.from(op.table).delete().eq('id', op.id)

            if (error) {
              if (isNetworkError(error)) return // reintentar más tarde
              // Error de datos (constraint, RLS): descartar para no trabar la cola
              console.warn('[sync] operación descartada:', op, error.message)
              rejected++
            }
            // Remover por identidad: si el coalescing reemplazó esta op
            // mientras se enviaba, la versión nueva queda en la cola
            set((s) => ({ pendingOps: s.pendingOps.filter((q) => q !== op) }))
          }
        } finally {
          set({ syncing: false })
          // El servidor rechazó cambios: avisar y re-sincronizar el estado
          // local con el remoto para que la UI no muestre datos que no existen
          if (rejected > 0) {
            get().addNotification({
              title: 'Algunos cambios no se guardaron',
              message: `El servidor rechazó ${rejected} cambio${rejected !== 1 ? 's' : ''}. La app se volvió a sincronizar.`,
              type: 'error',
            })
            const bizId = get().activeBusinessId
            if (bizId) void get().fetchAll(bizId)
          }
        }
      },

      // Modo demo activado desde la landing: carga datos de ejemplo al
      // instante y navega al dashboard, sin registro ni backend.
      enterDemo: () => {
        set({ ...demoDataPatch(), currentView: 'dashboard' })
      },

      // Salir de la demo para registrarse o iniciar sesión: a diferencia de
      // signOut(), va directo a AuthScreen en vez de volver a la landing.
      // No aplica al modo demo por env (VITE_DEMO_MODE): ese build no tiene
      // Supabase configurado.
      exitDemo: () => {
        if (DEMO_MODE) return
        set({ user: null, demoMode: false, landingSeen: true, onboardingDone: false, ...EMPTY_DATA })
      },

      // ── auth ──────────────────────────────────────
      initialize: async () => {
        // Modo demo (por env VITE_DEMO_MODE o porque el visitante ya tocó
        // "Ver demo"): sin Supabase, nunca se toca la red (ver enqueue/signOut).
        if (DEMO_MODE || get().demoMode) {
          set(demoDataPatch())
          return
        }

        set({ loadingAuth: true })

        // Evita re-bootear (doble fetch) cuando getSession y el evento
        // SIGNED_IN inicial informan al mismo usuario
        let bootedUserId: string | null = null
        const boot = async (userId: string, email: string) => {
          if (bootedUserId === userId) return
          bootedUserId = userId
          const prev = get().user
          const { plan, isFounder } = await fetchPlan(userId, prev?.id === userId ? prev.plan : 'free')
          const user: AppUser = {
            id: userId,
            email,
            plan,
            isFounder,
            businessId: prev?.id === userId ? prev.businessId : null,
          }
          set({ user })
          try {
            const biz = await get().ensureBusiness(userId)
            set({ user: { ...user, businessId: biz.id } })
            await get().fetchAll(biz.id)
          } catch {
            // Sin conexión: seguimos con los datos persistidos localmente
          }
        }

        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            await boot(session.user.id, session.user.email ?? '')
          }
        } finally {
          set({ loadingAuth: false })
        }

        supabase.auth.onAuthStateChange((_event, s) => {
          if (s?.user) {
            void boot(s.user.id, s.user.email ?? '').catch(() => {})
          } else {
            bootedUserId = null
            set({ user: null, ...EMPTY_DATA })
          }
        })
      },

      signOut: async () => {
        // Salir de la demo runtime: volver a la landing como visitante limpio.
        if (!DEMO_MODE && get().demoMode) {
          set({ user: null, demoMode: false, landingSeen: false, onboardingDone: false, currentView: 'landing', ...EMPTY_DATA })
          return
        }
        if (DEMO_MODE) { set({ user: null, ...EMPTY_DATA }); return }
        await supabase.auth.signOut()
        set({ user: null, ...EMPTY_DATA })
      },

      refreshPlan: async () => {
        const { user } = get()
        if (!user) return
        const { plan, isFounder } = await fetchPlan(user.id, user.plan)
        set({ user: { ...user, plan, isFounder } })
      },

      // ── bootstrap ──────────────────────────────────
      ensureBusiness: async (userId) => {
        const pickActive = (list: Business[]): Business => {
          const savedId = get().activeBusinessId
          return list.find((b) => b.id === savedId) ?? list[0]
        }

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at')

        if (error) {
          // Sin conexión: usar los emprendimientos persistidos
          const cached = get().businesses
          if (cached.length > 0) {
            const active = pickActive(cached)
            set({ business: active, activeBusinessId: active.id })
            return active
          }
          throw error
        }

        let list = mapRows<Business>((data ?? []) as Record<string, unknown>[])

        if (list.length === 0) {
          const { data: created, error: insErr } = await supabase
            .from('businesses')
            .insert({ user_id: userId, name: 'Mi emprendimiento', currency: 'ARS' })
            .select()
            .single()
          if (insErr || !created) {
            const cached = get().businesses
            if (cached.length > 0) {
              const active = pickActive(cached)
              set({ business: active, activeBusinessId: active.id })
              return active
            }
            throw insErr ?? new Error('No se pudo crear el emprendimiento')
          }
          list = [toCamel<Business>(created as Record<string, unknown>)]
        }

        const active = pickActive(list)
        set({ businesses: list, business: active, activeBusinessId: active.id })
        return active
      },

      updateBusiness: async (id, data) => {
        set((s) => ({
          business: s.business?.id === id ? { ...s.business, ...data } : s.business,
          businesses: s.businesses.map((b) => (b.id === id ? { ...b, ...data } : b)),
        }))
        const row = get().businesses.find((b) => b.id === id)
        const userId = get().user?.id
        if (!row || !userId) return
        get().enqueue({
          kind: 'upsert',
          table: 'businesses',
          row: { ...toSnake(row as unknown as Record<string, unknown>), user_id: userId },
        })
      },

      addBusiness: async (name) => {
        const { user } = get()
        if (!user) return
        const biz: Business = {
          id: uid(),
          name,
          currency: 'ARS',
          slug: null,
          whatsapp: '',
          createdAt: now(),
        }
        set((s) => ({ businesses: [...s.businesses, biz] }))
        get().enqueue({
          kind: 'upsert',
          table: 'businesses',
          row: { ...toSnake(biz as unknown as Record<string, unknown>), user_id: user.id },
        })
        await get().switchBusiness(biz.id)
      },

      switchBusiness: async (id) => {
        const biz = get().businesses.find((b) => b.id === id)
        if (!biz) return
        // El cache local guarda un solo negocio: al cambiar, descartar lo
        // que no sea del nuevo (offline muestra vacío, no datos ajenos)
        set((s) => ({
          business: biz,
          activeBusinessId: id,
          currentView: 'dashboard',
          products: s.products.filter((x) => x.businessId === id),
          customers: s.customers.filter((x) => x.businessId === id),
          customerGroups: s.customerGroups.filter((x) => x.businessId === id),
          orders: s.orders.filter((x) => x.businessId === id),
          expenses: s.expenses.filter((x) => x.businessId === id),
          socialMetrics: s.socialMetrics.filter((x) => x.businessId === id),
          appointments: s.appointments.filter((x) => x.businessId === id),
        }))
        await get().fetchAll(id)
      },

      fetchAll: async (businessId) => {
        set({ dataLoading: true })
        try {
          // Primero subir lo pendiente para no pisar cambios locales
          await get().flushQueue()
          if (get().pendingOps.length > 0) return

          const [p, cu, g, o, e, sm, ap] = await Promise.all([
            supabase.from('products').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
            supabase.from('customers').select('*').eq('business_id', businessId).order('name'),
            supabase.from('customer_groups').select('*').eq('business_id', businessId),
            supabase.from('orders').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
            supabase.from('expenses').select('*').eq('business_id', businessId).order('date', { ascending: false }),
            supabase.from('social_metrics').select('*').eq('business_id', businessId).order('week_start', { ascending: false }),
            supabase.from('appointments').select('*').eq('business_id', businessId).order('date'),
          ])
          // Solo pisar lo local cuando la consulta funcionó (offline: error → conservar)
          set({
            ...(p.error ? {} : { products: mapRows<Product>(p.data ?? []) }),
            ...(cu.error ? {} : { customers: mapRows<Customer>(cu.data ?? []) }),
            ...(g.error ? {} : { customerGroups: mapRows<CustomerGroup>(g.data ?? []) }),
            ...(o.error ? {} : { orders: mapRows<Order>(o.data ?? []) }),
            ...(e.error ? {} : { expenses: mapRows<Expense>(e.data ?? []) }),
            ...(sm.error ? {} : { socialMetrics: mapRows<SocialMetric>(sm.data ?? []) }),
            ...(ap.error ? {} : { appointments: mapRows<Appointment>(ap.data ?? []) }),
          })
        } finally {
          set({ dataLoading: false })
        }
      },

      // ── products ──────────────────────────────────
      addProduct: async (p) => {
        const item: Product = { ...p, id: uid(), createdAt: now() }
        set((s) => ({ products: [item, ...s.products] }))
        get().enqueue({ kind: 'upsert', table: 'products', row: toSnake(item as unknown as Record<string, unknown>) })
      },
      updateProduct: async (id, p) => {
        set((s) => ({ products: s.products.map((x) => x.id === id ? { ...x, ...p } : x) }))
        const row = get().products.find((x) => x.id === id)
        if (row) get().enqueue({ kind: 'upsert', table: 'products', row: toSnake(row as unknown as Record<string, unknown>) })
      },
      deleteProduct: async (id) => {
        set((s) => ({ products: s.products.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'products', id })
      },

      // ── customers ─────────────────────────────────
      addCustomer: async (c) => {
        const item: Customer = { ...c, id: uid(), createdAt: now() }
        set((s) => ({ customers: [item, ...s.customers] }))
        get().enqueue({ kind: 'upsert', table: 'customers', row: toSnake(item as unknown as Record<string, unknown>) })
      },
      updateCustomer: async (id, c) => {
        set((s) => ({ customers: s.customers.map((x) => x.id === id ? { ...x, ...c } : x) }))
        const row = get().customers.find((x) => x.id === id)
        if (row) get().enqueue({ kind: 'upsert', table: 'customers', row: toSnake(row as unknown as Record<string, unknown>) })
      },
      deleteCustomer: async (id) => {
        set((s) => ({ customers: s.customers.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'customers', id })
      },

      // ── groups ────────────────────────────────────
      addGroup: async (g) => {
        const item: CustomerGroup = { ...g, id: uid(), createdAt: now() }
        set((s) => ({ customerGroups: [item, ...s.customerGroups] }))
        get().enqueue({ kind: 'upsert', table: 'customer_groups', row: toSnake(item as unknown as Record<string, unknown>) })
      },
      updateGroup: async (id, g) => {
        set((s) => ({ customerGroups: s.customerGroups.map((x) => x.id === id ? { ...x, ...g } : x) }))
        const row = get().customerGroups.find((x) => x.id === id)
        if (row) get().enqueue({ kind: 'upsert', table: 'customer_groups', row: toSnake(row as unknown as Record<string, unknown>) })
      },
      deleteGroup: async (id) => {
        set((s) => ({ customerGroups: s.customerGroups.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'customer_groups', id })
      },

      // ── orders ────────────────────────────────────
      // Ajusta el stock de los productos con control activo (stock !== null).
      // Ítems con variantId descuentan el stock de esa variante; si la
      // variante ya no existe, se ignora en silencio (pedidos viejos).
      // sign = -1 al vender, +1 al deshacer (borrar/editar pedido).
      applyStock: async (items: OrderItem[], sign: 1 | -1) => {
        // Delta por producto+variante (misma variante repetida se acumula)
        const deltas = new Map<string, number>()
        for (const it of items) {
          if (!it.productId) continue
          const key = `${it.productId}:${it.variantId ?? ''}`
          deltas.set(key, (deltas.get(key) ?? 0) + sign * it.quantity)
        }
        const { products } = get()
        const updated = new Map<string, Product>()
        for (const [key, delta] of deltas) {
          const [pid, vid] = key.split(':')
          const p = updated.get(pid) ?? products.find((x) => x.id === pid)
          if (!p) continue
          if (vid) {
            const variant = p.variants?.find((v) => v.id === vid)
            if (!variant || variant.stock === null) continue
            updated.set(pid, {
              ...p,
              variants: (p.variants ?? []).map((v) =>
                v.id === vid ? { ...v, stock: Math.max(0, (v.stock ?? 0) + delta) } : v
              ),
            })
          } else {
            if (p.stock === null) continue
            updated.set(pid, { ...p, stock: Math.max(0, p.stock + delta) })
          }
        }
        if (updated.size === 0) return
        set((s) => ({
          products: s.products.map((p) => updated.get(p.id) ?? p),
        }))
        for (const row of updated.values()) {
          get().enqueue({ kind: 'upsert', table: 'products', row: toSnake(row as unknown as Record<string, unknown>) })
        }
      },

      addOrder: async (o) => {
        const item: Order = { ...o, id: uid(), createdAt: now() }
        set((s) => ({ orders: [item, ...s.orders] }))
        get().enqueue({ kind: 'upsert', table: 'orders', row: toSnake(item as unknown as Record<string, unknown>) })
        await get().applyStock(item.items, -1)
      },
      updateOrder: async (id, o) => {
        const prev = get().orders.find((x) => x.id === id)
        set((s) => ({ orders: s.orders.map((x) => x.id === id ? { ...x, ...o } : x) }))
        const row = get().orders.find((x) => x.id === id)
        if (row) get().enqueue({ kind: 'upsert', table: 'orders', row: toSnake(row as unknown as Record<string, unknown>) })
        // Si cambiaron los ítems, revertir el descuento anterior y aplicar el nuevo
        if (o.items && prev) {
          await get().applyStock(prev.items, 1)
          await get().applyStock(o.items, -1)
        }
      },
      deleteOrder: async (id) => {
        const prev = get().orders.find((x) => x.id === id)
        set((s) => ({ orders: s.orders.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'orders', id })
        if (prev) await get().applyStock(prev.items, 1)
      },

      // ── expenses ──────────────────────────────────
      addExpense: async (e) => {
        const item: Expense = { ...e, id: uid(), createdAt: now() }
        set((s) => ({ expenses: [item, ...s.expenses] }))
        get().enqueue({ kind: 'upsert', table: 'expenses', row: toSnake(item as unknown as Record<string, unknown>) })
      },
      updateExpense: async (id, e) => {
        set((s) => ({ expenses: s.expenses.map((x) => x.id === id ? { ...x, ...e } : x) }))
        const row = get().expenses.find((x) => x.id === id)
        if (row) get().enqueue({ kind: 'upsert', table: 'expenses', row: toSnake(row as unknown as Record<string, unknown>) })
      },
      deleteExpense: async (id) => {
        set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'expenses', id })
      },

      // ── social metrics ────────────────────────────
      upsertMetric: async (m) => {
        const existing = get().socialMetrics.find(
          (x) => x.businessId === m.businessId && x.platform === m.platform && x.weekStart === m.weekStart
        )
        const item: SocialMetric = {
          ...m,
          id: existing?.id ?? uid(),
          createdAt: existing?.createdAt ?? now(),
        }
        if (existing) {
          set((s) => ({ socialMetrics: s.socialMetrics.map((x) => x.id === item.id ? item : x) }))
        } else {
          set((s) => ({ socialMetrics: [item, ...s.socialMetrics] }))
        }
        get().enqueue({ kind: 'upsert', table: 'social_metrics', row: toSnake(item as unknown as Record<string, unknown>) })
      },
      deleteMetric: async (id) => {
        set((s) => ({ socialMetrics: s.socialMetrics.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'social_metrics', id })
      },

      // ── appointments ──────────────────────────────
      addAppointment: async (a) => {
        const item: Appointment = { ...a, id: uid(), createdAt: now() }
        set((s) => ({
          appointments: [...s.appointments, item].sort((x, y) =>
            x.date.localeCompare(y.date)
          ),
        }))
        get().enqueue({ kind: 'upsert', table: 'appointments', row: toSnake(item as unknown as Record<string, unknown>) })
      },
      updateAppointment: async (id, a) => {
        set((s) => ({ appointments: s.appointments.map((x) => x.id === id ? { ...x, ...a } : x) }))
        const row = get().appointments.find((x) => x.id === id)
        if (row) get().enqueue({ kind: 'upsert', table: 'appointments', row: toSnake(row as unknown as Record<string, unknown>) })
      },
      deleteAppointment: async (id) => {
        set((s) => ({ appointments: s.appointments.filter((x) => x.id !== id) }))
        get().enqueue({ kind: 'delete', table: 'appointments', id })
      },

      // ── ui ────────────────────────────────────────
      setView: (v) => set({ currentView: v }),

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid(), read: false, createdAt: now() },
            ...s.notifications,
          ].slice(0, 50),
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      setDarkMode: (mode) => {
        set({ darkMode: mode })
        applyDarkMode(mode)
      },

      setCookieConsent: (v) => set({ cookieConsent: v }),
      resetCookieConsent: () => set({ cookieConsent: null }),
      completeOnboarding: () => set({ onboardingDone: true }),
      setLandingSeen: () => set({ landingSeen: true }),
    }),
    {
      name: 'brota-v2',
      // Persistimos datos y cola para que la app funcione 100% offline
      partialize: (s) => ({
        currentView: s.currentView,
        demoMode: s.demoMode,
        darkMode: s.darkMode,
        cookieConsent: s.cookieConsent,
        onboardingDone: s.onboardingDone,
        landingSeen: s.landingSeen,
        activeBusinessId: s.activeBusinessId,
        business: s.business,
        businesses: s.businesses,
        products: s.products,
        customers: s.customers,
        customerGroups: s.customerGroups,
        orders: s.orders,
        expenses: s.expenses,
        socialMetrics: s.socialMetrics,
        appointments: s.appointments,
        pendingOps: s.pendingOps,
        notifications: s.notifications,
        user: s.user
          ? {
              id: s.user.id,
              email: s.user.email,
              plan: s.user.plan,
              businessId: s.user.businessId,
            }
          : null,
      }),
    }
  )
)
