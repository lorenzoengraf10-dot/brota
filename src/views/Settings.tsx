import { useState } from 'react'
import { Sun, Moon, Monitor, Download, LogOut, Pencil, Check, X, Lock, Store, Copy, Plus, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { today, slugify } from '@/lib/format'
import { FREE_LIMITS, PRO_PRICE, APP_URL, canExport, canAddBusiness, waSupportLink, waDeleteLink } from '@/lib/plan'
import { trackEvent } from '@/lib/gaTracking'
import { exportOrders, exportExpenses, exportProducts, exportCustomers } from '@/lib/export'
import UpgradeModal from '@/components/plan/UpgradeModal'
import ShareCard from '@/components/marketing/ShareCard'

const DARK_OPTIONS: { id: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
]

export default function Settings() {
  const {
    user, business, businesses, products, customers, orders, expenses,
    darkMode, setDarkMode, updateBusiness, addBusiness, switchBusiness, signOut,
  } = useStore()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(business?.name ?? '')
  const [waInput, setWaInput] = useState(business?.whatsapp ?? '')
  const [addingBiz, setAddingBiz] = useState(false)
  const [newBizName, setNewBizName] = useState('')
  const [copied, setCopied] = useState(false)

  const catalogUrl = business?.slug ? `${APP_URL}/tienda/${business.slug}` : null

  async function activateCatalog() {
    if (!business) return
    const slug = `${slugify(business.name) || 'mi-negocio'}-${business.id.slice(0, 4)}`
    await updateBusiness(business.id, { slug })
    trackEvent('catalog_activated')
  }

  async function saveWhatsapp() {
    if (!business) return
    await updateBusiness(business.id, { whatsapp: waInput.replace(/\D/g, '') })
  }

  function copyCatalogLink() {
    if (!catalogUrl) return
    navigator.clipboard.writeText(catalogUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    trackEvent('catalog_link_copied')
  }

  async function handleAddBusiness() {
    if (!canAddBusiness(user?.plan ?? 'free', businesses.length)) {
      setShowUpgrade(true)
      return
    }
    if (!newBizName.trim()) return
    await addBusiness(newBizName.trim())
    trackEvent('business_created')
    setNewBizName('')
    setAddingBiz(false)
  }

  const month = today().slice(0, 7)
  const ordersThisMonth = orders.filter((o) => o.date.startsWith(month)).length
  const expensesThisMonth = expenses.filter((e) => e.date.startsWith(month)).length

  async function saveName() {
    if (business && nameInput.trim()) {
      await updateBusiness(business.id, { name: nameInput.trim() })
    }
    setEditingName(false)
  }

  function handleExport(fn: () => void) {
    if (!canExport(user?.plan ?? 'free')) { setShowUpgrade(true); return }
    fn()
  }

  async function handleSignOut() {
    if (confirm('¿Cerrar sesión?')) await signOut()
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-6">
      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Plan</h2>
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          {user?.plan === 'pro' ? (
            <div>
              <p className="font-bold text-ink mb-1">Sos Pro 🌱</p>
              <p className="text-sm text-ink-soft">Gracias por apoyar Brota. Disfrutá de todo sin límites.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <UsageBar label="Productos" count={products.length} limit={FREE_LIMITS.products} />
              <UsageBar label="Clientes" count={customers.length} limit={FREE_LIMITS.clients} />
              <UsageBar label="Ventas este mes" count={ordersThisMonth} limit={FREE_LIMITS.ordersPerMonth} />
              <UsageBar label="Gastos este mes" count={expensesThisMonth} limit={FREE_LIMITS.expensesPerMonth} />
              <button
                onClick={() => setShowUpgrade(true)}
                className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-1"
              >
                Pasate a Pro · {PRO_PRICE}
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Apariencia</h2>
        <div className="bg-surface rounded-2xl p-2 shadow-sm flex gap-1">
          {DARK_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = darkMode === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setDarkMode(opt.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium ${
                  active ? 'bg-brand-600 text-white' : 'text-ink-soft'
                }`}
              >
                <Icon size={18} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Negocio</h2>
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                className="flex-1 bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink"
              />
              <button onClick={saveName} className="p-2 rounded-xl bg-brand-600 text-white">
                <Check size={16} />
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(business?.name ?? '') }} className="p-2 rounded-xl bg-black/5 text-ink-soft">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-soft mb-0.5">Nombre del emprendimiento</p>
                <p className="font-semibold text-ink">{business?.name}</p>
              </div>
              <button onClick={() => { setNameInput(business?.name ?? ''); setEditingName(true) }} className="p-2 rounded-xl bg-black/5 text-ink-soft">
                <Pencil size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mis emprendimientos */}
        <div className="bg-surface rounded-2xl p-2 shadow-sm mt-2 divide-y divide-black/5">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => b.id !== business?.id && switchBusiness(b.id)}
              className="w-full flex items-center justify-between p-3 text-left"
            >
              <span className={`text-sm font-medium ${b.id === business?.id ? 'text-brand-600' : 'text-ink'}`}>
                {b.name}
              </span>
              {b.id === business?.id ? (
                <span className="text-[10px] font-bold text-brand-600 bg-brand-600/10 px-2 py-1 rounded-full">ACTIVO</span>
              ) : (
                <ChevronRight size={15} className="text-ink-soft" />
              )}
            </button>
          ))}
          {addingBiz ? (
            <div className="flex items-center gap-2 p-3">
              <input
                type="text" value={newBizName} onChange={(e) => setNewBizName(e.target.value)}
                placeholder="Nombre del nuevo emprendimiento" autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddBusiness()}
                className="flex-1 bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
              />
              <button onClick={handleAddBusiness} className="p-2 rounded-xl bg-brand-600 text-white">
                <Check size={16} />
              </button>
              <button onClick={() => setAddingBiz(false)} className="p-2 rounded-xl bg-black/5 text-ink-soft">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!canAddBusiness(user?.plan ?? 'free', businesses.length)) { setShowUpgrade(true); return }
                setAddingBiz(true)
              }}
              className="w-full flex items-center justify-between p-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-brand-600">
                <Plus size={15} /> Nuevo emprendimiento
              </span>
              {!canAddBusiness(user?.plan ?? 'free', businesses.length) && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-600/10 px-2 py-1 rounded-full">
                  <Lock size={10} /> PRO
                </span>
              )}
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Catálogo online</h2>
        <div className="bg-surface rounded-2xl p-4 shadow-sm space-y-3">
          {catalogUrl ? (
            <>
              <div>
                <p className="text-xs text-ink-soft mb-1">Tu catálogo público</p>
                <div className="flex items-center gap-2">
                  <a href={catalogUrl} target="_blank" rel="noreferrer" className="flex-1 text-sm text-brand-600 font-medium truncate underline">
                    {catalogUrl.replace('https://', '')}
                  </a>
                  <button onClick={copyCatalogLink} className="flex items-center gap-1 text-xs font-semibold bg-black/5 dark:bg-white/10 text-ink px-2.5 py-1.5 rounded-xl shrink-0">
                    {copied ? <Check size={13} className="text-brand-600" /> : <Copy size={13} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[11px] text-ink-soft mt-1.5">
                  Compartilo en tu bio de Instagram o por WhatsApp: tus clientes ven los productos y te piden directo.
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-soft mb-1">WhatsApp para recibir pedidos</p>
                <div className="flex items-center gap-2">
                  <input
                    type="tel" placeholder="5491100000000" value={waInput}
                    onChange={(e) => setWaInput(e.target.value)}
                    className="flex-1 bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
                  />
                  <button onClick={saveWhatsapp} className="p-2 rounded-xl bg-brand-600 text-white shrink-0">
                    <Check size={16} />
                  </button>
                </div>
                {!business?.whatsapp && (
                  <p className="text-[11px] text-amber-600 mt-1.5">Sin número, el botón "Pedir" no aparece en tu catálogo.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
                <Store size={18} className="text-brand-600" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Mostrá tus productos online</p>
                <p className="text-xs text-ink-soft mt-0.5 mb-3">
                  Un link con tu catálogo para compartir en redes. Tus clientes piden por WhatsApp.
                </p>
                <button onClick={activateCatalog} className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                  Activar mi catálogo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Exportar datos</h2>
        <div className="bg-surface rounded-2xl p-2 shadow-sm divide-y divide-black/5">
          <ExportRow label="Ventas" pro={!canExport(user?.plan ?? 'free')} onClick={() => handleExport(() => exportOrders(orders))} />
          <ExportRow label="Gastos" pro={!canExport(user?.plan ?? 'free')} onClick={() => handleExport(() => exportExpenses(expenses))} />
          <ExportRow label="Productos" pro={!canExport(user?.plan ?? 'free')} onClick={() => handleExport(() => exportProducts(products))} />
          <ExportRow label="Clientes" pro={!canExport(user?.plan ?? 'free')} onClick={() => handleExport(() => exportCustomers(customers))} />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Recomendá Brota</h2>
        <ShareCard />
      </section>

      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Cuenta</h2>
        <div className="bg-surface rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <p className="text-xs text-ink-soft mb-0.5">Email</p>
            <p className="font-medium text-ink text-sm">{user?.email}</p>
          </div>
          <a href={waSupportLink(user?.email)} target="_blank" rel="noreferrer" className="block text-sm text-brand-600 font-medium">
            Ayuda y soporte
          </a>
          <a href={waDeleteLink(user?.email ?? '')} target="_blank" rel="noreferrer" className="block text-sm text-red-500 font-medium">
            Eliminar mi cuenta
          </a>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-ink-soft font-medium pt-1">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </section>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function UsageBar({ label, count, limit }: { label: string; count: number; limit: number }) {
  const pct = Math.min(100, Math.round((count / limit) * 100))
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-xs font-medium text-ink">{count}/{limit}</p>
      </div>
      <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${ pct >= 100 ? 'bg-red-500' : 'bg-brand-600' }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ExportRow({ label, pro, onClick }: { label: string; pro: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 text-left">
      <span className="text-sm text-ink font-medium">{label}</span>
      {pro ? (
        <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 bg-brand-600/10 px-2 py-1 rounded-full">
          <Lock size={10} /> PRO
        </span>
      ) : (
        <Download size={16} className="text-ink-soft" />
      )}
    </button>
  )
}
