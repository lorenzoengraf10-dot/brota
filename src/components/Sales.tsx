import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, ChevronDown } from 'lucide-react'
import { useSalesStore } from '@/store/useSalesStore'
import { useProductsStore } from '@/store/useProductsStore'
import { useClientsStore } from '@/store/useClientsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import type { Sale, SaleItem } from '@/types'

const PAYMENT_METHODS = ['efectivo', 'transferencia', 'debito', 'credito', 'otro'] as const
const STATUS_OPTS = ['pagado', 'pendiente', 'cancelado'] as const

export default function Sales() {
  const { user } = useAuthStore()
  const { sales, loading, fetch, add, remove } = useSalesStore()
  const { products, fetch: fetchProducts } = useProductsStore()
  const { clients, fetch: fetchClients } = useClientsStore()
  const { addNotification } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [items, setItems] = useState<SaleItem[]>([])
  const [clientName, setClientName] = useState('')
  const [payment, setPayment] = useState<Sale['paymentMethod']>('efectivo')
  const [status, setStatus] = useState<Sale['status']>('pagado')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(user.id)
    fetchProducts(user.id)
    fetchClients(user.id)
  }, [user])

  const addItem = (productId: string) => {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i)
      return [...prev, { productId: p.id, productName: p.name, quantity: 1, unitPrice: p.price, subtotal: p.price }]
    })
  }

  const removeItem = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId))

  const total = items.reduce((a, i) => a + i.subtotal, 0)

  const handleSave = async () => {
    if (!user || items.length === 0) return
    setSaving(true)
    await add({ userId: user.id, clientName: clientName || undefined, items, total, paymentMethod: payment, status, notes: notes || undefined })
    addNotification({ title: 'Venta registrada', message: `$${total.toLocaleString('es-AR')} — ${status}`, type: 'success' })
    setItems([]); setClientName(''); setNotes(''); setShowForm(false)
    setSaving(false)
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Ventas</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-2 bg-[#059669] text-white text-sm font-medium rounded-xl">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-5 max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Nueva venta</h3>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Cliente (opcional)</label>
                <input
                  list="clients-list"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                />
                <datalist id="clients-list">
                  {clients.map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Agregar producto</label>
                <div className="relative">
                  <select
                    onChange={(e) => { if (e.target.value) addItem(e.target.value); e.target.value = '' }}
                    className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm appearance-none focus:outline-none focus:border-[#059669]"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.filter((p) => p.active).map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {items.length > 0 && (
                <div className="bg-[#f6f2e8] rounded-xl p-3 mb-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-2">
                      <span className="text-sm flex-1">{item.productName}</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = Math.max(1, Number(e.target.value))
                          setItems((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: qty, subtotal: qty * i.unitPrice } : i))
                        }}
                        className="w-14 text-center border border-[#e5e0d5] rounded-lg py-1 text-sm bg-white"
                      />
                      <span className="text-sm font-semibold w-20 text-right">{fmt(item.subtotal)}</span>
                      <button onClick={() => removeItem(item.productId)}><Trash2 size={14} className="text-rose-400" /></button>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-[#e5e0d5]">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-sm font-bold text-[#059669]">{fmt(total)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Pago</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value as Sale['paymentMethod'])} className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm">
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as Sale['status'])} className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm">
                    {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <textarea
                placeholder="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm mb-4 focus:outline-none focus:border-[#059669] resize-none"
              />

              <button
                onClick={handleSave}
                disabled={saving || items.length === 0}
                className="w-full py-3 bg-[#059669] text-white font-semibold rounded-xl text-sm disabled:opacity-50"
              >
                {saving ? 'Guardando...' : `Guardar venta ${items.length > 0 ? fmt(total) : ''}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" /></div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ShoppingCartEmpty />
          <p className="mt-2 text-sm">Sin ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 border border-[#e5e0d5]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{s.clientName ?? 'Cliente ocasional'}</p>
                  <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('es-AR')} · {s.paymentMethod}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.items.length} producto{s.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#059669]">{fmt(s.total)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    s.status === 'pagado' ? 'bg-green-100 text-green-700' :
                    s.status === 'pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>{s.status}</span>
                </div>
              </div>
              <button onClick={() => remove(s.id)} className="mt-2 text-xs text-rose-400 hover:text-rose-600">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function ShoppingCartEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto opacity-30">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
