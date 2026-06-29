import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, CreditCard } from 'lucide-react'
import { useExpensesStore } from '@/store/useExpensesStore'
import { useAuthStore } from '@/store/useAuthStore'

const CATEGORIES = ['materia prima', 'packaging', 'transporte', 'servicios', 'marketing', 'personal', 'impuestos', 'alquiler', 'tecnología', 'otro']

export default function Expenses() {
  const { user } = useAuthStore()
  const { expenses, loading, fetch, add, remove } = useExpensesStore()
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('otro')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) fetch(user.id) }, [user])

  const handleSave = async () => {
    if (!user || !description.trim() || !amount) return
    setSaving(true)
    await add({ userId: user.id, description: description.trim(), amount: Number(amount), category, date, notes: notes || undefined })
    setDescription(''); setAmount(''); setCategory('otro'); setNotes(''); setShowForm(false); setSaving(false)
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
  const totalMonth = expenses
    .filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((a, e) => a + e.amount, 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gastos</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-2 bg-[#059669] text-white text-sm font-medium rounded-xl">
          <Plus size={16} /> Registrar
        </button>
      </div>

      <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
        <p className="text-xs text-rose-400 mb-1">Total gastos este mes</p>
        <p className="text-2xl font-bold text-rose-500">{fmt(totalMonth)}</p>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30 }}
              className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-5 max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Registrar gasto</h3>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción*" className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]" />
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Monto*" className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm resize-none focus:outline-none focus:border-[#059669]" />
                <button onClick={handleSave} disabled={saving || !description || !amount} className="w-full py-3 bg-[#059669] text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Registrar gasto'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" /></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><CreditCard size={48} className="mx-auto opacity-30" /><p className="mt-2 text-sm">Sin gastos registrados</p></div>
      ) : (
        <div className="space-y-3">
          {expenses.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl p-4 border border-[#e5e0d5] flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{e.description}</p>
                <p className="text-xs text-gray-400">{e.date} · <span className="capitalize">{e.category}</span></p>
                {e.notes && <p className="text-xs text-gray-400 mt-0.5">{e.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-rose-500">{fmt(e.amount)}</p>
                <button onClick={() => remove(e.id)} className="text-rose-400"><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
