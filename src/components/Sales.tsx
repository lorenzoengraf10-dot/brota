import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, ChevronDown, CalendarDays } from 'lucide-react'
import { useSalesStore } from '@/store/useSalesStore'
import { useProductsStore } from '@/store/useProductsStore'
import { useClientsStore } from '@/store/useClientsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { isAtLimit } from '@/lib/plans'
import UpgradeModal from './UpgradeModal'
import type { Sale, SaleItem } from '@/types'

const PAYMENT_METHODS = ['efectivo', 'transferencia', 'debito', 'credito', 'otro'] as const
const STATUS_OPTS = ['pagado', 'pendiente', 'cancelado'] as const

type Filter = 'todos' | 'activos' | 'completados'

const ORDER_BADGE: Record<string, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700' },
  listo: { label: 'Listo p/ entregar', cls: 'bg-blue-100 text-blue-700' },
  completado: { label: 'Completado', cls: 'bg-emerald-100 text-emerald-700' },
}

const PAYMENT_BADGE: Record<string, string> = {
  pagado: 'bg-green-100 text-green-700',
  pendiente: 'bg-amber-100 text-amber-700',
  cancelado: 'bg-gray-100 text-gray-500',
}

export default function Sales() {
  const { user } = useAuthStore()
  const { sales, loading, fetch, add, remove, update } = useSalesStore()
  const { products, fetch: fetchProducts } = useProductsStore()
  const { clients, fetch: fetchClients } = useClientsStore()
  const { addNotification } = useAppStore()

  const [filter, setFilter] = useState<Filter>('todos')
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const [items, setItems] = useState<SaleItem[]>([])
  const [clientName, setClientName] = useState('')
  const [payment, setPayment] = useState<Sale['paymentMethod']>('efectivo')
  const [status, setStatus] = useState<Sale['status']>('pagado')
  const [notes, setNotes] = useState('')
  const [orderStatus, setOrderStatus] = useState<Sale['orderStatus'] | ''>('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed')
  const [discountValue, setDiscountValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(user.id)
    fetchProducts(user.id)
    fetchClients(user.id)
  }, [user])

  const thisMonth = new Date().toISOString().slice(0, 7)
  const salesThisMonth = sales.filter((s) => s.createdAt.startsWith(thisMonth)).length

  const openNewSale = () => {
    if (isAtLimit(user?.plan ?? 'free', 'salesPerMonth', salesThisMonth)) {
      setShowUpgrade(true)
      return
    }
    setItems([])
    setClientName('')
    setNotes('')
    setOrderStatus('')
    setDeliveryDate('')
    setDiscountValue('')
    setDiscountType('fixed')
    setPayment('efectivo')
    setStatus('pagado')
    setShowForm(true)
  }

  const addItem = (productId: string) => {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        )
      }
      return [...prev, { productId: p.id, productName: p.name, quantity: 1, unitPrice: p.price, subtotal: p.price }]
    })
  }

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId))

  const itemsSubtotal = items.reduce((a, i) => a + i.subtotal, 0)
  const discountNum = parseFloat(discountValue) || 0
  const discountAmount =
    discountNum > 0
      ? discountType === 'percentage'
        ? itemsSubtotal * (discountNum / 100)
        : Math.min(discountNum, itemsSubtotal)
      : 0
  const total = Math.max(0, itemsSubtotal - discountAmount)

  const handleSave = async () => {
    if (!user || items.length === 0) return
    setSaving(true)
    const os = (orderStatus as Sale['orderStatus']) || undefined
    await add({
      userId: user.id,
      clientName: clientName || undefined,
      items,
      subtotal: itemsSubtotal,
      discount: discountNum || undefined,
      discountType: discountNum ? discountType : undefined,
      discountAmount: discountAmount || undefined,
      total,
      paymentMethod: payment,
      status,
      orderStatus: os,
      deliveryDate: deliveryDate || undefined,
      notes: notes || undefined,
    })
    addNotification({
      title: os ? 'Pedido registrado' : 'Venta registrada',
      message: `${fmt(total)}${discountAmount ? ` · desc. ${fmt(discountAmount)}` : ''} — ${os ?? status}`,
      type: 'success',
    })
    setShowForm(false)
    setSaving(false)
  }

  const activeOrders = sales.filter((s) => s.orderStatus && s.orderStatus !== 'completado')
  const completedOrders = sales.filter((s) => s.orderStatus === 'completado')

  const filteredSales = sales.filter((s) => {
    if (filter === 'activos') return !!s.orderStatus && s.orderStatus !== 'completado'
    if (filter === 'completados') return s.orderStatus === 'completado'
    return true
  })

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 pb-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Ventas &amp; Pedidos</h2>
        <button
          onClick={openNewSale}
          className="flex items-center gap-1 px-3 py-2 bg-[#059669] text-white text-sm font-medium rounded-xl"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {([
          ['todos', 'Todos', sales.length],
          ['activos', 'Pedidos', activeOrders.length],
          ['completados', 'Completados', completedOrders.length],
        ] as [Filter, string, number][]).map(([f, label, count]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[#059669] text-white'
                : 'bg-white text-gray-500 border border-[#e5e0d5]'
            }`}
          >
            {label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filter === f ? 'bg-white/20 text-white' : 'bg-[#f6f2e8] text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="bg-white w-full max-h-[92vh] overflow-y-auto rounded-t-3xl p-5 max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Nueva venta / pedido</h3>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>

              {/* Client */}
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

              {/* Products */}
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

              {/* Items list */}
              {items.length > 0 && (
                <div className="bg-[#f6f2e8] rounded-xl p-3 mb-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-2">
                      <span className="text-sm flex-1 truncate">{item.productName}</span>
                      <input
                        type="number" min={1} value={item.quantity}
                        onChange={(e) => {
                          const qty = Math.max(1, Number(e.target.value))
                          setItems((prev) =>
                            prev.map((i) =>
                              i.productId === item.productId
                                ? { ...i, quantity: qty, subtotal: qty * i.unitPrice }
                                : i
                            )
                          )
                        }}
                        className="w-14 text-center border border-[#e5e0d5] rounded-lg py-1 text-sm bg-white"
                      />
                      <span className="text-sm font-medium w-20 text-right">{fmt(item.subtotal)}</span>
                      <button onClick={() => removeItem(item.productId)}>
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  ))}

                  <div className="border-t border-[#e5e0d5] pt-2 space-y-1">
                    {discountAmount > 0 && (
                      <>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Subtotal</span>
                          <span>{fmt(itemsSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-rose-500">
                          <span>Descuento{discountType === 'percentage' ? ` (${discountNum}%)` : ''}</span>
                          <span>-{fmt(discountAmount)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm font-bold">Total</span>
                      <span className="text-sm font-bold text-[#059669]">{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Discount */}
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Descuento (opcional)</label>
                <div className="flex gap-2">
                  <div className="flex bg-[#f6f2e8] rounded-xl p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        discountType === 'fixed' ? 'bg-white shadow text-[#059669]' : 'text-gray-400'
                      }`}
                    >$</button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        discountType === 'percentage' ? 'bg-white shadow text-[#059669]' : 'text-gray-400'
                      }`}
                    >%</button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={discountType === 'percentage' ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'Ej: 10' : 'Ej: 500'}
                    className="flex-1 px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Forma de pago</label>
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value as Sale['paymentMethod'])}
                    className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Estado de pago</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Sale['status'])}
                    className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm"
                  >
                    {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Order tracking */}
              <div className="bg-[#f6f2e8] rounded-xl p-3 mb-3 space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Seguimiento del pedido</p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Estado del pedido</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as Sale['orderStatus'] | '')}
                    className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm bg-white"
                  >
                    <option value="">Sin seguimiento</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="listo">Listo para entregar</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
                {orderStatus && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <CalendarDays size={12} /> Fecha de entrega (opcional)
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm bg-white focus:outline-none focus:border-[#059669]"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
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
                {saving ? 'Guardando...' : `Guardar${items.length > 0 ? ` · ${fmt(total)}` : ''}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto opacity-30">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <p className="mt-2 text-sm">Sin registros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 border border-[#e5e0d5]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.clientName ?? 'Cliente ocasional'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(s.createdAt).toLocaleDateString('es-AR')} · {s.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.items.length} producto{s.items.length !== 1 ? 's' : ''}
                    {s.discountAmount ? ` · desc. ${fmt(s.discountAmount)}` : ''}
                  </p>
                  {s.deliveryDate && (
                    <p className="text-xs text-[#059669] mt-1 flex items-center gap-1">
                      <CalendarDays size={11} />
                      Entrega: {new Date(s.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="font-bold text-[#059669]">{fmt(s.total)}</p>
                  {s.orderStatus && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium block ${
                      ORDER_BADGE[s.orderStatus]?.cls ?? ''
                    }`}>
                      {ORDER_BADGE[s.orderStatus]?.label}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block ${
                    PAYMENT_BADGE[s.status] ?? 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>

              {/* Quick order status actions */}
              {s.orderStatus && s.orderStatus !== 'completado' && (
                <div className="mt-3 flex gap-2">
                  {s.orderStatus === 'pendiente' && (
                    <button
                      onClick={() => update(s.id, { orderStatus: 'listo' })}
                      className="flex-1 text-xs py-1.5 px-3 bg-blue-50 text-blue-600 rounded-lg font-medium border border-blue-100"
                    >
                      Marcar listo ✓
                    </button>
                  )}
                  <button
                    onClick={() => update(s.id, { orderStatus: 'completado' })}
                    className="flex-1 text-xs py-1.5 px-3 bg-emerald-50 text-emerald-600 rounded-lg font-medium border border-emerald-100"
                  >
                    {s.orderStatus === 'listo' ? 'Marcar completado ✓' : 'Completar'}
                  </button>
                </div>
              )}

              <button
                onClick={() => remove(s.id)}
                className="mt-2 text-xs text-rose-400 hover:text-rose-600"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </motion.div>
  )
}
