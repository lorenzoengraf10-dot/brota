import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, CalendarDays } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatShortDate, toLocalISO } from '@/lib/format'
import type { Appointment, AppointmentType, Order } from '@/types'

const TYPE_LABEL: Record<AppointmentType, string> = {
  cita: 'Cita',
  tarea: 'Tarea',
  recordatorio: 'Recordatorio',
  otro: 'Otro',
}

const TYPE_COLOR: Record<AppointmentType, string> = {
  cita: 'bg-brand-600',
  tarea: 'bg-azure-600',
  recordatorio: 'bg-amber-500',
  otro: 'bg-gray-400',
}

const TYPES = Object.keys(TYPE_LABEL) as AppointmentType[]
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

type DayEvent = { kind: 'appointment'; item: Appointment } | { kind: 'order'; item: Order }

const toISO = toLocalISO

function emptyAppointment(businessId: string, date: string): Omit<Appointment, 'id' | 'createdAt'> {
  return { businessId, title: '', description: '', type: 'cita', date }
}

export default function Calendar() {
  const { appointments, orders, business, addAppointment, updateAppointment, deleteAppointment } = useStore()
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selected, setSelected] = useState(() => toISO(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7

  const eventsByDay = new Map<string, DayEvent[]>()
  appointments.forEach((a) => {
    const list = eventsByDay.get(a.date) ?? []
    list.push({ kind: 'appointment', item: a })
    eventsByDay.set(a.date, list)
  })
  orders.forEach((o) => {
    if (!o.dueDate) return
    const list = eventsByDay.get(o.dueDate) ?? []
    list.push({ kind: 'order', item: o })
    eventsByDay.set(o.dueDate, list)
  })

  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toISO(new Date(year, month, i + 1))
    ),
  ]

  const todayISO = toISO(new Date())
  const selectedEvents = eventsByDay.get(selected) ?? []

  function changeMonth(delta: number) {
    const d = new Date(cursor)
    d.setMonth(d.getMonth() + delta)
    setCursor(d)
  }

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este evento?')) await deleteAppointment(id)
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 flex items-center justify-between mb-3">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl bg-surface shadow-sm">
          <ChevronLeft size={18} className="text-ink" />
        </button>
        <p className="font-bold text-ink capitalize">
          {cursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </p>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-xl bg-surface shadow-sm">
          <ChevronRight size={18} className="text-ink" />
        </button>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <p key={i} className="text-center text-[11px] font-semibold text-ink-soft">{w}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />
            const day = parseInt(date.slice(-2))
            const hasEvents = eventsByDay.has(date)
            const isToday = date === todayISO
            const isSelected = date === selected
            return (
              <button
                key={date}
                onClick={() => setSelected(date)}
                className={`relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium ${
                  isSelected ? 'bg-brand-600 text-white' : isToday ? 'bg-brand-600/10 text-brand-600' : 'text-ink'
                }`}
              >
                {day}
                {hasEvents && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${ isSelected ? 'bg-white' : 'bg-brand-600' }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
          {formatShortDate(selected)}
        </h3>

        {selectedEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-azure-600/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-azure-600" />
            </span>
            <p className="text-ink-soft text-sm">No hay eventos este día.</p>
          </div>
        )}

        <div className="space-y-2">
          {selectedEvents.map((ev) =>
            ev.kind === 'appointment' ? (
              <div key={`a-${ev.item.id}`} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ TYPE_COLOR[ev.item.type] }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{ev.item.title}</p>
                  <p className="text-xs text-ink-soft">{TYPE_LABEL[ev.item.type]}</p>
                  {ev.item.description && <p className="text-xs text-ink-soft truncate">{ev.item.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditing(ev.item); setShowForm(true) }}
                    className="p-2 rounded-xl bg-black/5 text-ink-soft"
                  >
                    <X size={14} className="rotate-45" />
                  </button>
                  <button onClick={() => handleDelete(ev.item.id)} className="p-2 rounded-xl bg-red-50 text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div key={`o-${ev.item.id}`} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-rose-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">Entrega: {ev.item.customerName || 'Cliente ocasional'}</p>
                  <p className="text-xs text-ink-soft">Pedido #{ev.item.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <button
        onClick={() => { setEditing(null); setShowForm(true) }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {showForm && (
        <AppointmentForm
          initial={editing}
          businessId={business?.id ?? ''}
          defaultDate={selected}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editing) await updateAppointment(editing.id, data)
            else await addAppointment(data as Omit<Appointment, 'id' | 'createdAt'>)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

function AppointmentForm({
  initial, businessId, defaultDate, onClose, onSave,
}: {
  initial: Appointment | null
  businessId: string
  defaultDate: string
  onClose: () => void
  onSave: (data: Partial<Appointment>) => Promise<void>
}) {
  const [form, setForm] = useState(() =>
    initial
      ? { title: initial.title, description: initial.description, type: initial.type, date: initial.date, businessId: initial.businessId }
      : emptyAppointment(businessId, defaultDate)
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
          <h2 className="font-bold text-ink text-lg">{initial ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5 pb-8">
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Título</label>
            <input type="text" placeholder="Título del evento" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${ form.type === t ? 'bg-brand-600 text-white' : 'bg-black/5 dark:bg-white/10 text-ink-soft' }`}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Fecha</label>
            <input type="date" value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Descripción</label>
            <textarea placeholder="Detalle (opcional)" value={form.description} rows={3}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft resize-none" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Agregar evento')}
          </button>
        </div>
      </div>
    </div>
  )
}
