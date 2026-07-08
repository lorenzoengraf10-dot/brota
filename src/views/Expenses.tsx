import { useState } from 'react'
import { Plus, X, Trash2, Receipt as ReceiptIcon } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, today } from '@/lib/format'
import { isAtLimit, FREE_LIMITS } from '@/lib/plan'
import { trackEvent } from '@/lib/gaTracking'
import UpgradeModal from '@/components/plan/UpgradeModal'
import type { Expense, ExpenseCategory } from '@/types'

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  insumos: 'Insumos',
  servicios: 'Servicios',
  alquiler: 'Alquiler',
  sueldos: 'Sueldos',
  impuestos: 'Impuestos',
  envios: 'Envíos',
  marketing: 'Marketing',
  otros: 'Otros',
}

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ExpenseCategory[]

function emptyExpense(businessId: string): Omit<Expense, 'id' | 'createdAt'> {
  return { businessId, amount: 0, category: 'insumos', note: '', date: today() }
}

export default function Expenses() {
  const { expenses, business, user, addExpense, updateExpense, deleteExpense } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [month, setMonth] = useState(today().slice(0, 7))
  const [category, setCategory] = useState<ExpenseCategory | 'all'>('all')

  const inMonth = expenses.filter((e) => e.date.startsWith(month))
  const filtered = inMonth.filter((e) => category === 'all' || e.category === category)
  const total = filtered.reduce((a, e) => a + e.amount, 0)
  const atLimit = isAtLimit(user?.plan ?? 'free', 'expensesPerMonth', inMonth.length)

  function openNew() {
    if (atLimit) { setShowUpgrade(true); return }
    setEditing(null)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este gasto?')) await deleteExpense(id)
  }

  return (
    <div className="pb-24">
      <div className="p-4 flex items-center gap-3">
        <input
          type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-surface rounded-2xl px-4 py-2.5 text-sm text-ink shadow-sm"
        />
        <div className="flex-1 bg-surface rounded-2xl px-4 py-2.5 shadow-sm text-right">
          <p className="text-[10px] text-ink-soft uppercase tracking-wide">Total del período</p>
          <p className="font-bold text-ink">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="px-4 flex gap-2 overflow-x-auto pb-1 mb-2">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${ category === 'all' ? 'bg-brand-600 text-white' : 'bg-surface text-ink-soft' }`}
        >
          Todos
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${ category === c ? 'bg-brand-600 text-white' : 'bg-surface text-ink-soft' }`}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {user?.plan === 'free' && (
        <div className="px-4 mb-3">
          <div className="bg-surface rounded-2xl p-3 flex items-center justify-between">
            <p className="text-xs text-ink-soft">{inMonth.length}/{FREE_LIMITS.expensesPerMonth} gastos este mes (plan gratuito)</p>
            <button onClick={() => setShowUpgrade(true)} className="text-xs text-brand-600 font-semibold">Actualizar</button>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-azure-600/10 flex items-center justify-center">
              <ReceiptIcon size={24} className="text-azure-600" />
            </span>
            <p className="text-ink-soft text-sm">No hay gastos para este filtro.</p>
          </div>
        )}

        {filtered.map((expense) => (
          <div key={expense.id} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-azure-600/10 text-azure-600 text-[11px] font-medium">
                  {CATEGORY_LABEL[expense.category]}
                </span>
                <p className="text-xs text-ink-soft">{formatDate(expense.date)}</p>
              </div>
              <p className="font-semibold text-ink">{formatCurrency(expense.amount)}</p>
              {expense.note && <p className="text-xs text-ink-soft truncate">{expense.note}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => { setEditing(expense); setShowForm(true) }}
                className="p-2 rounded-xl bg-black/5 text-ink-soft"
              >
                <X size={14} className="rotate-45" />
              </button>
              <button onClick={() => handleDelete(expense.id)} className="p-2 rounded-xl bg-red-50 text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {showForm && (
        <ExpenseForm
          initial={editing}
          businessId={business?.id ?? ''}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editing) await updateExpense(editing.id, data)
            else { await addExpense(data as Omit<Expense, 'id' | 'createdAt'>); trackEvent('expense_created') }
            setShowForm(false)
          }}
        />
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function ExpenseForm({
  initial, businessId, onClose, onSave,
}: {
  initial: Expense | null
  businessId: string
  onClose: () => void
  onSave: (data: Partial<Expense>) => Promise<void>
}) {
  const [form, setForm] = useState(() =>
    initial
      ? { amount: initial.amount, category: initial.category, note: initial.note, date: initial.date, businessId: initial.businessId }
      : emptyExpense(businessId)
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (form.amount <= 0) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
          <h2 className="font-bold text-ink text-lg">{initial ? 'Editar gasto' : 'Nuevo gasto'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5 pb-8">
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Monto</label>
            <input type="number" min="0" placeholder="0" value={form.amount || ''}
              onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${ form.category === c ? 'bg-brand-600 text-white' : 'bg-black/5 dark:bg-white/10 text-ink-soft' }`}
                >
                  {CATEGORY_LABEL[c]}
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
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Nota</label>
            <textarea placeholder="Detalle del gasto (opcional)" value={form.note} rows={2}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft resize-none" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Agregar gasto')}
          </button>
        </div>
      </div>
    </div>
  )
}
