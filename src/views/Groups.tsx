import { useState } from 'react'
import { Plus, X, Pencil, Trash2, Tag } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { CustomerGroup } from '@/types'

const PALETTE = [
  '#ef4444','#f97316','#eab308','#22c55e','#10b981',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899','#6b7280',
]

function emptyGroup(businessId: string): Omit<CustomerGroup, 'id' | 'createdAt'> {
  return { businessId, name: '', color: PALETTE[0] }
}

export default function Groups() {
  const { customerGroups, customers, business, addGroup, updateGroup, deleteGroup } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CustomerGroup | null>(null)

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este grupo?')) await deleteGroup(id)
  }

  return (
    <div className="p-4 pb-24">
      <p className="text-xs text-ink-soft mb-4">Organizá tus clientes en grupos para segmentar mejor.</p>

      {customerGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Tag size={24} className="text-purple-500" />
          </span>
          <p className="text-ink-soft text-sm">Todavía no tenés grupos.</p>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="text-brand-600 font-medium text-sm">+ Crear grupo</button>
        </div>
      )}

      <div className="space-y-2">
        {customerGroups.map(group => {
          const count = customers.filter(c => c.groupId === group.id).length
          return (
            <div key={group.id} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: group.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">{group.name}</p>
                <p className="text-xs text-ink-soft">{count} {count === 1 ? 'cliente' : 'clientes'}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(group); setShowForm(true) }} className="p-2 rounded-xl bg-black/5 text-ink-soft">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(group.id)} className="p-2 rounded-xl bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {showForm && (
        <GroupForm
          initial={editing}
          businessId={business?.id ?? ''}
          onClose={() => setShowForm(false)}
          onSave={async data => {
            if (editing) await updateGroup(editing.id, data)
            else await addGroup(data as Omit<CustomerGroup, 'id' | 'createdAt'>)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function GroupForm({
  initial, businessId, onClose, onSave,
}: {
  initial: CustomerGroup | null
  businessId: string
  onClose: () => void
  onSave: (data: Partial<CustomerGroup>) => Promise<void>
}) {
  const [form, setForm] = useState(() =>
    initial
      ? { name: initial.name, color: initial.color, businessId: initial.businessId }
      : emptyGroup(businessId)
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
      <div className="relative bg-surface rounded-t-3xl">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5">
          <h2 className="font-bold text-ink text-lg">{initial ? 'Editar grupo' : 'Nuevo grupo'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="p-5 space-y-5 pb-10">
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Nombre del grupo</label>
            <input type="text" placeholder="ej: Mayoristas, VIP..." value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-3">Color</label>
            <div className="flex gap-3 flex-wrap">
              {PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-9 h-9 rounded-full transition-transform ${ form.color === color ? 'scale-125 ring-2 ring-offset-2 ring-black/20' : '' }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-black/5 rounded-xl">
            <span className="w-8 h-8 rounded-lg" style={{ backgroundColor: form.color }} />
            <span className="text-sm font-medium text-ink">{form.name || 'Vista previa'}</span>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Crear grupo')}
          </button>
        </div>
      </div>
    </div>
  )
}
