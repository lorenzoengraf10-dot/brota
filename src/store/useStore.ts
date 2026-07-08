import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
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

async function fetchPlan(userId: string): Promise<Plan> {
  const { data } = await supabase
    .from('user_plans')
    .select('plan')
    .eq('user_id', userId)
    .single()
  return ((data as { plan?: string } | null)?.plan as Plan) ?? 'free'
}

function applyDarkMode(mode: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else if (mode === 'light') root.classList.remove('dark')
  else {
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? root.classList.add('dark')
      : root.classList.remove('dark')
  }
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

  // UI
  currentView: View
  notifications: Notification[]
  darkMode: 'light' | 'dark' | 'system'
  cookieConsent: boolean | null
  onboardingDone: boolean
  landingSeen: boolean

  // Auth
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  refreshPlan: () => Promise<void>

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

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      loadingAuth: true,
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
      currentView: 'dashboard',
      notifications: [],
      darkMode: 'system',
      cookieConsent: null,
      onboardingDone: false,
      landingSeen: false,

      // ── auth ──────────────────────────────────────
      initialize: async () => {
        set({ loadingAuth: true })
        const { data: { session } } = await supabase.auth.getSession()

        // Evita re-bootear (doble fetch) cuando getSession y el evento
        // SIGNED_IN inicial informan al mismo usuario
        let bootedUserId: string | null = null
        const boot = async (userId: string, email: string) => {
          if (bootedUserId === userId) return
          bootedUserId = userId
          const plan = await fetchPlan(userId)
          const user: AppUser = { id: userId, email, plan, businessId: null }
          set({ user })
          const biz = await get().ensureBusiness(userId)
          set({ user: { ...user, businessId: biz.id } })
          await get().fetchAll(biz.id)
        }

        if (session?.user) {
          await boot(session.user.id, session.user.email ?? '')
        }
        set({ loadingAuth: false })

        supabase.auth.onAuthStateChange(async (_event, s) => {
          if (s?.user) {
            await boot(s.user.id, s.user.email ?? '')
          } else {
            bootedUserId = null
            set({
              user: null,
              business: null,
              products: [],
              customers: [],
              customerGroups: [],
              orders: [],
              expenses: [],
              socialMetrics: [],
              appointments: [],
            })
          }
        })
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({
          user: null,
          business: null,
          products: [],
          customers: [],
          customerGroups: [],
          orders: [],
          expenses: [],
          socialMetrics: [],
          appointments: [],
        })
      },

      refreshPlan: async () => {
        const { user } = get()
        if (!user) return
        const plan = await fetchPlan(user.id)
        set({ user: { ...user, plan } })
      },

      // ── bootstrap ──────────────────────────────────
      ensureBusiness: async (userId) => {
        const { data } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at')

        let list = mapRows<Business>((data ?? []) as Record<string, unknown>[])

        if (list.length === 0) {
          const { data: created } = await supabase
            .from('businesses')
            .insert({ user_id: userId, name: 'Mi emprendimiento', currency: 'ARS' })
            .select()
            .single()
          list = [toCamel<Business>(created as Record<string, unknown>)]
        }

        // Restaurar el emprendimiento activo si sigue existiendo
        const savedId = get().activeBusinessId
        const active = list.find((b) => b.id === savedId) ?? list[0]
        set({ businesses: list, business: active, activeBusinessId: active.id })
        return active
      },

      updateBusiness: async (id, data) => {
        set((s) => ({
          business: s.business?.id === id ? { ...s.business, ...data } : s.business,
          businesses: s.businesses.map((b) => (b.id === id ? { ...b, ...data } : b)),
        }))
        await supabase.from('businesses').update(toSnake(data as Record<string, unknown>)).eq('id', id)
      },

      addBusiness: async (name) => {
        const { user } = get()
        if (!user) return
        const { data: created } = await supabase
          .from('businesses')
          .insert({ user_id: user.id, name, currency: 'ARS' })
          .select()
          .single()
        if (!created) return
        const biz = toCamel<Business>(created as Record<string, unknown>)
        set((s) => ({ businesses: [...s.businesses, biz] }))
        await get().switchBusiness(biz.id)
      },

      switchBusiness: async (id) => {
        const biz = get().businesses.find((b) => b.id === id)
        if (!biz) return
        set({ business: biz, activeBusinessId: id, currentView: 'dashboard' })
        await get().fetchAll(id)
      },

      fetchAll: async (businessId) => {
        set({ dataLoading: true })
        const [p, cu, g, o, e, sm, ap] = await Promise.all([
          supabase.from('products').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
          supabase.from('customers').select('*').eq('business_id', businessId).order('name'),
          supabase.from('customer_groups').select('*').eq('business_id', businessId),
          supabase.from('orders').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
          supabase.from('expenses').select('*').eq('business_id', businessId).order('date', { ascending: false }),
          supabase.from('social_metrics').select('*').eq('business_id', businessId).order('week_start', { ascending: false }),
          supabase.from('appointments').select('*').eq('business_id', businessId).order('date'),
        ])
        set({
          products: mapRows<Product>(p.data ?? []),
          customers: mapRows<Customer>(cu.data ?? []),
          customerGroups: mapRows<CustomerGroup>(g.data ?? []),
          orders: mapRows<Order>(o.data ?? []),
          expenses: mapRows<Expense>(e.data ?? []),
          socialMetrics: mapRows<SocialMetric>(sm.data ?? []),
          appointments: mapRows<Appointment>(ap.data ?? []),
          dataLoading: false,
        })
      },

      // ── products ──────────────────────────────────
      addProduct: async (p) => {
        const item: Product = { ...p, id: uid(), createdAt: now() }
        set((s) => ({ products: [item, ...s.products] }))
        await supabase.from('products').insert(toSnake(item as unknown as Record<string, unknown>))
      },
      updateProduct: async (id, p) => {
        set((s) => ({ products: s.products.map((x) => x.id === id ? { ...x, ...p } : x) }))
        await supabase.from('products').update(toSnake(p as unknown as Record<string, unknown>)).eq('id', id)
      },
      deleteProduct: async (id) => {
        set((s) => ({ products: s.products.filter((x) => x.id !== id) }))
        await supabase.from('products').delete().eq('id', id)
      },

      // ── customers ─────────────────────────────────
      addCustomer: async (c) => {
        const item: Customer = { ...c, id: uid(), createdAt: now() }
        set((s) => ({ customers: [item, ...s.customers] }))
        await supabase.from('customers').insert(toSnake(item as unknown as Record<string, unknown>))
      },
      updateCustomer: async (id, c) => {
        set((s) => ({ customers: s.customers.map((x) => x.id === id ? { ...x, ...c } : x) }))
        await supabase.from('customers').update(toSnake(c as unknown as Record<string, unknown>)).eq('id', id)
      },
      deleteCustomer: async (id) => {
        set((s) => ({ customers: s.customers.filter((x) => x.id !== id) }))
        await supabase.from('customers').delete().eq('id', id)
      },

      // ── groups ────────────────────────────────────
      addGroup: async (g) => {
        const item: CustomerGroup = { ...g, id: uid(), createdAt: now() }
        set((s) => ({ customerGroups: [item, ...s.customerGroups] }))
        await supabase.from('customer_groups').insert(toSnake(item as unknown as Record<string, unknown>))
      },
      updateGroup: async (id, g) => {
        set((s) => ({ customerGroups: s.customerGroups.map((x) => x.id === id ? { ...x, ...g } : x) }))
        await supabase.from('customer_groups').update(toSnake(g as unknown as Record<string, unknown>)).eq('id', id)
      },
      deleteGroup: async (id) => {
        set((s) => ({ customerGroups: s.customerGroups.filter((x) => x.id !== id) }))
        await supabase.from('customer_groups').delete().eq('id', id)
      },

      // ── orders ────────────────────────────────────
      // Ajusta el stock de los productos con control activo (stock !== null).
      // sign = -1 al vender, +1 al deshacer (borrar/editar pedido).
      applyStock: async (items: OrderItem[], sign: 1 | -1) => {
        const deltas = new Map<string, number>()
        for (const it of items) {
          if (!it.productId) continue
          deltas.set(it.productId, (deltas.get(it.productId) ?? 0) + sign * it.quantity)
        }
        const { products } = get()
        const updates: { id: string; stock: number }[] = []
        for (const [pid, delta] of deltas) {
          const p = products.find((x) => x.id === pid)
          if (!p || p.stock === null) continue
          updates.push({ id: pid, stock: Math.max(0, p.stock + delta) })
        }
        if (updates.length === 0) return
        set((s) => ({
          products: s.products.map((p) => {
            const u = updates.find((x) => x.id === p.id)
            return u ? { ...p, stock: u.stock } : p
          }),
        }))
        await Promise.all(
          updates.map((u) => supabase.from('products').update({ stock: u.stock }).eq('id', u.id))
        )
      },

      addOrder: async (o) => {
        const item: Order = { ...o, id: uid(), createdAt: now() }
        set((s) => ({ orders: [item, ...s.orders] }))
        await supabase.from('orders').insert(toSnake(item as unknown as Record<string, unknown>))
        await get().applyStock(item.items, -1)
      },
      updateOrder: async (id, o) => {
        const prev = get().orders.find((x) => x.id === id)
        set((s) => ({ orders: s.orders.map((x) => x.id === id ? { ...x, ...o } : x) }))
        await supabase.from('orders').update(toSnake(o as unknown as Record<string, unknown>)).eq('id', id)
        // Si cambiaron los ítems, revertir el descuento anterior y aplicar el nuevo
        if (o.items && prev) {
          await get().applyStock(prev.items, 1)
          await get().applyStock(o.items, -1)
        }
      },
      deleteOrder: async (id) => {
        const prev = get().orders.find((x) => x.id === id)
        set((s) => ({ orders: s.orders.filter((x) => x.id !== id) }))
        await supabase.from('orders').delete().eq('id', id)
        if (prev) await get().applyStock(prev.items, 1)
      },

      // ── expenses ──────────────────────────────────
      addExpense: async (e) => {
        const item: Expense = { ...e, id: uid(), createdAt: now() }
        set((s) => ({ expenses: [item, ...s.expenses] }))
        await supabase.from('expenses').insert(toSnake(item as unknown as Record<string, unknown>))
      },
      updateExpense: async (id, e) => {
        set((s) => ({ expenses: s.expenses.map((x) => x.id === id ? { ...x, ...e } : x) }))
        await supabase.from('expenses').update(toSnake(e as unknown as Record<string, unknown>)).eq('id', id)
      },
      deleteExpense: async (id) => {
        set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) }))
        await supabase.from('expenses').delete().eq('id', id)
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
        await supabase.from('social_metrics').upsert(toSnake(item as unknown as Record<string, unknown>))
      },
      deleteMetric: async (id) => {
        set((s) => ({ socialMetrics: s.socialMetrics.filter((x) => x.id !== id) }))
        await supabase.from('social_metrics').delete().eq('id', id)
      },

      // ── appointments ──────────────────────────────
      addAppointment: async (a) => {
        const item: Appointment = { ...a, id: uid(), createdAt: now() }
        set((s) => ({
          appointments: [...s.appointments, item].sort((x, y) =>
            x.date.localeCompare(y.date)
          ),
        }))
        await supabase.from('appointments').insert(toSnake(item as unknown as Record<string, unknown>))
      },
      updateAppointment: async (id, a) => {
        set((s) => ({ appointments: s.appointments.map((x) => x.id === id ? { ...x, ...a } : x) }))
        await supabase.from('appointments').update(toSnake(a as unknown as Record<string, unknown>)).eq('id', id)
      },
      deleteAppointment: async (id) => {
        set((s) => ({ appointments: s.appointments.filter((x) => x.id !== id) }))
        await supabase.from('appointments').delete().eq('id', id)
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
      partialize: (s) => ({
        currentView: s.currentView,
        darkMode: s.darkMode,
        cookieConsent: s.cookieConsent,
        onboardingDone: s.onboardingDone,
        landingSeen: s.landingSeen,
        activeBusinessId: s.activeBusinessId,
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
