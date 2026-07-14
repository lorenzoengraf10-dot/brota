import { useState } from 'react'
import { Plus, X, Pencil, Trash2, MessageCircle, Users, Tag, HandCoins } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { isAtLimit, FREE_LIMITS, LAUNCH_FREE } from '@/lib/plan'
import { formatCurrency, parseCount } from '@/lib/format'
import { orderTotal, openWhatsApp } from '@/lib/receipt'
import { trackEvent } from '@/lib/gaTracking'
import UpgradeModal from '@/components/plan/UpgradeModal'
import type { Customer, Sex } from '@/types'

const SEX_LABEL: Record<Sex, string> = { F: 'F', M: 'M', Otro: 'Otro', '': '-' }

function emptyCustomer(businessId: string): Omit<Customer, 'id' | 'createdAt'> {
  return { businessId, name: '', phone: '', age: null, sex: '', groupId: null, notes: '' }
}

export default function Customers() {
  const { customers, customerGroups, orders, business, user, addCustomer, updateCustomer, deleteCustomer, setView } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )
  const atLimit = isAtLimit(user?.plan ?? 'free', 'clients', customers.length)

  function openNew() {
    if (atLimit) { setShowUpgrade(true); return }
    setEditing(null)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este cliente?')) await deleteCustomer(id)
  }

  function debtOf(customerId: string): number {
    return orders
      .filter(o => o.customerId === customerId && o.paid === false)
      .reduce((s, o) => s + orderTotal(o), 0)
  }

  function sendReminder(c: Customer, debt: number) {
    const msg = `Hola ${c.name}! 😊 Te escribo de ${business?.name ?? 'mi emprendimiento'}. Te recuerdo que tenés un saldo pendiente de ${formatCurrency(debt)}. ¿Coordinamos el pago? ¡Gracias!`
    trackEvent('debt_reminder_sent')
    openWhatsApp(c.phone, msg)
  }

  return (
    <div className="pb-24">
      <div className="p-4 flex gap-2">
        <input
          type="text" placeholder="Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-surface rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft shadow-sm"
        />
        <button
          onClick={() => setView('groups')}
          className="flex items-center gap-1.5 bg-surface rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-soft shadow-sm shrink-0"
        >
          <Tag size={15} /> Grupos
        </button>
      </div>

      {!LAUNCH_FREE && user?.plan === 'free' && (
        <div className="px-4 mb-3">
          <div className="bg-surface rounded-2xl p-3 flex items-center justify-between">
            <p className="text-xs text-ink-soft">{customers.length}/{FREE_LIMITS.clients} clientes (plan gratuito)</p>
            <button onClick={() => setShowUpgrade(true)} className="text-xs text-brand-600 font-semibold">Actualizar</button>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Users size={24} className="text-purple-500" />
            </span>
            <p className="text-ink-soft text-sm">{search ? 'Sin resultados.' : 'Todavía no tenés clientes.'}</p>
            {!search && <button onClick={openNew} className="text-brand-600 font-medium text-sm">+ Agregar cliente</button>}
          </div>
        )}

        {filtered.map(c => {
          const group = customerGroups.find(g => g.id === c.groupId)
          const debt = debtOf(c.id)
          return (
            <div key={c.id} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                style={{ backgroundColor: group?.color ?? '#a78bfa' }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink truncate">{c.name}</p>
                  {group && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white shrink-0"
                      style={{ backgroundColor: group.color }}>
                      {group.name}
                    </span>
                  )}
                </div>
                {c.phone && <p className="text-xs text-ink-soft">{c.phone}</p>}
                {(c.age || c.sex) && (
                  <p className="text-xs text-ink-soft">
                    {c.age ? `${c.age} años` : ''}{c.age && c.sex ? ' · ' : ''}{c.sex ? SEX_LABEL[c.sex] : ''}
                  </p>
                )}
                {c.notes && <p className="text-xs text-ink-soft truncate">{c.notes}</p>}
                {debt > 0 && (c.phone ? (
                  <button
                    onClick={() => sendReminder(c, debt)}
                    className="flex items-center gap-1 mt-1 text-xs font-semibold text-rose-600"
                  >
                    <HandCoins size={13} />
                    Debe {formatCurrency(debt)} · Recordar por WA
                  </button>
                ) : (
                  <p className="flex items-center gap-1 mt-1 text-xs font-semibold text-rose-600">
                    <HandCoins size={13} />
                    Debe {formatCurrency(debt)}
                  </p>
                ))}
              </div>
              <div className="flex gap-1 shrink-0">
                {c.phone && (
                  <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366]">
                    <MessageCircle size={14} />
                  </a>
                )}
                <button onClick={() => { setEditing(c); setShowForm(true) }} className="p-2 rounded-xl bg-black/5 text-ink-soft">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {showForm && (
        <CustomerForm
          initial={editing}
          businessId={business?.id ?? ''}
          onClose={() => setShowForm(false)}
          onSave={async data => {
            if (editing) await updateCustomer(editing.id, data)
            else { await addCustomer(data as Omit<Customer, 'id' | 'createdAt'>); trackEvent('customer_created') }
            setShowForm(false)
          }}
        />
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function CustomerForm({
  initial, businessId, onClose, onSave,
}: {
  initial: Customer | null
  businessId: string
  onClose: () => void
  onSave: (data: Partial<Customer>) => Promise<void>
}) {
  const { customerGroups } = useStore()
  const [form, setForm] = useState(() =>
    initial
      ? { name: initial.name, phone: initial.phone, age: initial.age, sex: initial.sex, groupId: initial.groupId, notes: initial.notes, businessId: initial.businessId }
      : emptyCustomer(businessId)
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
          <h2 className="font-bold text-ink text-lg">{initial ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4 pb-8">
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Nombre *</label>
            <input type="text" placeholder="Nombre del cliente" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Teléfono (WhatsApp)</label>
            <input type="tel" placeholder="5491100000000" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft" />
            <p className="text-[11px] text-ink-soft mt-1">Formato internacional sin +, ej: 5491100000000</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Edad</label>
              <input type="number" min="0" max="120" placeholder="—" value={form.age ?? ''}
                onChange={e => setForm(f => ({ ...f, age: parseCount(e.target.value) || null }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Género</label>
              <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value as Sex }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink">
                <option value="">—</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {customerGroups.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Grupo</label>
              <select value={form.groupId ?? ''} onChange={e => setForm(f => ({ ...f, groupId: e.target.value || null }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink">
                <option value="">Sin grupo</option>
                {customerGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Preferencias, dirección, etc."
              rows={3}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft resize-none" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Agregar cliente')}
          </button>
        </div>
      </div>
    </div>
  )
}
