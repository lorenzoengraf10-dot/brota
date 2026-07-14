import { useState } from 'react'
import { Plus, X, Trash2, MessageCircle, ChevronRight, ArrowRight, Zap } from 'lucide-react'
import QuickSale from '@/components/orders/QuickSale'
import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, today, parseMoney, parseCount } from '@/lib/format'
import { orderTotal, buildReceipt, openWhatsApp } from '@/lib/receipt'
import { dueState, dueLabel, dueBadgeClass } from '@/lib/delivery'
import { isAtLimit } from '@/lib/plan'
import { trackEvent } from '@/lib/gaTracking'
import UpgradeModal from '@/components/plan/UpgradeModal'
import type { Order, OrderItem, OrderStatus, PaymentMethod, DiscountType } from '@/types'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  ready: 'Listo para entregar',
  completed: 'Entregado',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'ready',
  ready: 'completed',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  ready: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  mercadopago: 'MercadoPago',
  transferencia: 'Transferencia',
}

type Filter = 'all' | OrderStatus | 'fiado'

function emptyDraft(businessId: string): Omit<Order, 'id' | 'createdAt'> {
  return {
    businessId,
    customerId: null,
    customerName: '',
    items: [],
    discount: 0,
    discountType: 'amount',
    status: 'pending',
    dueDate: null,
    date: today(),
    note: '',
    paymentMethod: 'efectivo',
    paid: true,
  }
}

export default function Orders() {
  const { orders, customers, business, user, addOrder, updateOrder, deleteOrder } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showQuickSale, setShowQuickSale] = useState(false)

  const filtered =
    filter === 'all' ? orders :
    filter === 'fiado' ? orders.filter(o => o.paid === false) :
    orders.filter(o => o.status === filter)
  const thisMonth = orders.filter(o => o.date.startsWith(today().slice(0, 7))).length
  const atLimit = isAtLimit(user?.plan ?? 'free', 'ordersPerMonth', thisMonth)

  function openNew() {
    if (atLimit) { setShowUpgrade(true); return }
    setEditingOrder(null)
    setShowForm(true)
  }

  function openQuickSale() {
    if (atLimit) { setShowUpgrade(true); return }
    setShowQuickSale(true)
  }

  async function handleAdvance(order: Order) {
    const next = NEXT_STATUS[order.status]
    if (next) await updateOrder(order.id, { status: next })
  }

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este pedido?')) await deleteOrder(id)
  }

  function handleWhatsApp(order: Order) {
    const customer = customers.find(c => c.id === order.customerId)
    const phone = customer?.phone ?? ''
    const msg = buildReceipt(order, business?.name ?? 'Mi negocio')
    openWhatsApp(phone, msg)
  }

  return (
    <div className="pb-24">
      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto [scrollbar-width:none] sticky top-0 bg-cream z-10">
        {(['all', 'pending', 'ready', 'completed', 'fiado'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-brand-600 text-white' : 'bg-surface text-ink-soft border border-black/10'
            }`}
          >
            {s === 'all' ? 'Todos' : s === 'fiado' ? 'Fiado' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3 lg:items-start">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <p className="text-ink-soft text-sm">Sin pedidos{filter !== 'all' ? ` con estado "${STATUS_LABEL[filter as OrderStatus]}"` : ''}.</p>
            <button onClick={openNew} className="text-brand-600 font-medium text-sm">+ Crear pedido</button>
          </div>
        )}

        {filtered.map(order => {
          const ds = dueState(order.dueDate)
          const isExpanded = expandedId === order.id
          const next = NEXT_STATUS[order.status]
          const subtotal = order.items.reduce((s, i) => s + i.unitSalePrice * i.quantity, 0)
          const discountAmt = order.discountType === 'percent' ? subtotal * (order.discount / 100) : order.discount

          return (
            <div key={order.id} className="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <button
                className="w-full p-4 flex items-start gap-3 text-left"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink">{order.customerName || 'Sin nombre'}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                    {order.dueDate && ds !== 'none' && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${dueBadgeClass(ds)}`}>
                        {dueLabel(order.dueDate)}
                      </span>
                    )}
                    {order.paid === false && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700">
                        Fiado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft mt-1">
                    {formatDate(order.date)} · {order.items.length} ítem{order.items.length !== 1 ? 's' : ''} · {PAYMENT_LABEL[order.paymentMethod]}
                  </p>
                  {order.dueDate && <p className="text-xs text-ink-soft">Entrega: {formatDate(order.dueDate)}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-ink">{formatCurrency(orderTotal(order))}</p>
                  <ChevronRight size={14} className={`text-ink-soft mt-1 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-black/5 pt-3 space-y-3">
                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-ink-soft">{item.quantity}× {item.name}</span>
                        <span className="text-ink">{formatCurrency(item.unitSalePrice * item.quantity)}</span>
                      </div>
                    ))}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-soft">Descuento</span>
                        <span className="text-red-500">-{order.discountType === 'percent' ? `${order.discount}%` : formatCurrency(discountAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold border-t border-black/5 pt-1">
                      <span className="text-ink">Total</span>
                      <span className="text-ink">{formatCurrency(orderTotal(order))}</span>
                    </div>
                  </div>

                  {order.note && (
                    <p className="text-xs text-ink-soft bg-black/5 rounded-xl p-2">{order.note}</p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {order.paid === false && (
                      <button
                        onClick={() => updateOrder(order.id, { paid: true })}
                        className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2 px-3 rounded-xl"
                      >
                        ✓ Marcar pagado
                      </button>
                    )}
                    {next && (
                      <button
                        onClick={() => handleAdvance(order)}
                        className="flex-1 bg-brand-600 text-white text-sm font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1"
                      >
                        <ArrowRight size={14} /> {STATUS_LABEL[next]}
                      </button>
                    )}
                    <button
                      onClick={() => handleWhatsApp(order)}
                      className="bg-[#25D366] text-white text-sm font-medium py-2 px-3 rounded-xl flex items-center gap-1"
                    >
                      <MessageCircle size={14} /> WA
                    </button>
                    <button
                      onClick={() => { setEditingOrder(order); setShowForm(true) }}
                      className="bg-black/5 text-ink text-sm font-medium py-2 px-3 rounded-xl"
                    >
                      Editar
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="bg-red-50 text-red-500 py-2 px-3 rounded-xl">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={openQuickSale}
        className="fixed bottom-[9.5rem] lg:bottom-24 right-4 lg:right-8 h-11 px-4 bg-surface text-brand-600 border border-brand-600/30 rounded-2xl shadow-lg flex items-center gap-1.5 justify-center z-30 active:scale-95 transition-transform text-sm font-bold"
      >
        <Zap size={16} /> Venta rápida
      </button>
      <button
        onClick={openNew}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <QuickSale open={showQuickSale} onClose={() => setShowQuickSale(false)} />
      {showForm && (
        <OrderForm
          initial={editingOrder}
          businessId={business?.id ?? ''}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editingOrder) await updateOrder(editingOrder.id, data)
            else {
              await addOrder(data as Omit<Order, 'id' | 'createdAt'>)
              trackEvent('order_created')
            }
            setShowForm(false)
          }}
        />
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function OrderForm({
  initial, businessId, onClose, onSave,
}: {
  initial: Order | null
  businessId: string
  onClose: () => void
  onSave: (data: Partial<Order>) => Promise<void>
}) {
  const { products, customers } = useStore()
  const [form, setForm] = useState<Omit<Order, 'id' | 'createdAt'>>(() =>
    initial
      ? { businessId: initial.businessId, customerId: initial.customerId, customerName: initial.customerName, items: [...initial.items], discount: initial.discount, discountType: initial.discountType, status: initial.status, dueDate: initial.dueDate, date: initial.date, note: initial.note, paymentMethod: initial.paymentMethod, paid: initial.paid !== false }
      : emptyDraft(businessId)
  )
  const [saving, setSaving] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [itemProductId, setItemProductId] = useState('')
  const [itemVariantId, setItemVariantId] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('1')
  const [itemPrice, setItemPrice] = useState('')
  const [itemCost, setItemCost] = useState('0')

  const pickedProduct = products.find(p => p.id === itemProductId)
  const needsVariant = !!pickedProduct?.variants?.length && !itemVariantId

  function pickProduct(id: string) {
    const p = products.find(p => p.id === id)
    if (!p) return
    setItemProductId(p.id)
    setItemVariantId('')
    setItemName(p.name)
    setItemPrice(String(p.salePrice))
    setItemCost(String(p.costPrice))
  }

  function pickVariant(vid: string) {
    const p = products.find(p => p.id === itemProductId)
    const v = p?.variants?.find(v => v.id === vid)
    setItemVariantId(vid)
    if (!p || !v) return
    setItemName(`${p.name} — ${v.name}`)
    setItemPrice(String(v.salePrice ?? p.salePrice))
    setItemCost(String(v.costPrice ?? p.costPrice))
  }

  function addItem() {
    if (!itemName.trim() || needsVariant) return
    const item: OrderItem = {
      productId: itemProductId,
      name: itemName.trim(),
      quantity: Math.max(1, parseCount(itemQty)),
      unitSalePrice: parseMoney(itemPrice),
      unitCostPrice: parseMoney(itemCost),
      variantId: itemVariantId || null,
    }
    setForm(f => ({ ...f, items: [...f.items, item] }))
    setItemProductId(''); setItemVariantId(''); setItemName(''); setItemQty('1'); setItemPrice(''); setItemCost('0')
    setShowItemForm(false)
  }

  const subtotal = form.items.reduce((s, i) => s + i.unitSalePrice * i.quantity, 0)
  const discountAmt = form.discountType === 'percent' ? subtotal * (form.discount / 100) : form.discount
  const total = Math.max(0, subtotal - discountAmt)

  async function handleSave() {
    if (form.items.length === 0) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col w-full sm:max-w-lg">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
          <h2 className="font-bold text-ink text-lg">{initial ? 'Editar pedido' : 'Nuevo pedido'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5 pb-8">
          {/* Customer */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Cliente</label>
            {customers.length > 0 && (
              <select
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink mb-2"
                value={form.customerId ?? ''}
                onChange={e => {
                  const c = customers.find(c => c.id === e.target.value)
                  setForm(f => ({ ...f, customerId: c?.id ?? null, customerName: c?.name ?? f.customerName }))
                }}
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <input
              type="text" placeholder="Nombre del cliente"
              value={form.customerName}
              onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Ítems</label>
              <button onClick={() => setShowItemForm(v => !v)} className="text-xs text-brand-600 font-medium flex items-center gap-1">
                <Plus size={12} /> Agregar
              </button>
            </div>

            {showItemForm && (
              <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 space-y-2 mb-3">
                {products.length > 0 && (
                  <select
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-ink"
                    value={itemProductId}
                    onChange={e => pickProduct(e.target.value)}
                  >
                    <option value="">Producto de la lista...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.salePrice)}</option>)}
                  </select>
                )}
                {!!pickedProduct?.variants?.length && (
                  <select
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-ink"
                    value={itemVariantId}
                    onChange={e => pickVariant(e.target.value)}
                  >
                    <option value="">Elegí la variante...</option>
                    {pickedProduct.variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name}{v.stock !== null ? ` (stock: ${v.stock})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <input type="text" placeholder="Nombre del ítem" value={itemName} onChange={e => setItemName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Cant." min="1" value={itemQty} onChange={e => setItemQty(e.target.value)}
                    className="w-1/3 bg-surface rounded-lg px-3 py-2 text-sm text-ink" />
                  <input type="number" placeholder="Precio" min="0" value={itemPrice} onChange={e => setItemPrice(e.target.value)}
                    className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-ink" />
                </div>
                <button onClick={addItem} disabled={needsVariant}
                  className="w-full bg-brand-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
                  {needsVariant ? 'Elegí la variante primero' : 'Agregar ítem'}
                </button>
              </div>
            )}

            {form.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{item.quantity}× {item.name}</p>
                  <p className="text-xs text-ink-soft">{formatCurrency(item.unitSalePrice)} c/u</p>
                </div>
                <span className="text-sm font-medium text-ink shrink-0">{formatCurrency(item.unitSalePrice * item.quantity)}</span>
                <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))} className="text-red-400 shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Descuento</label>
            <div className="flex gap-2">
              <div className="flex rounded-xl overflow-hidden border border-black/10">
                {(['amount', 'percent'] as DiscountType[]).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, discountType: t }))}
                    className={`px-3 py-2 text-sm font-medium ${ form.discountType === t ? 'bg-brand-600 text-white' : 'bg-surface text-ink-soft' }`}>
                    {t === 'amount' ? '$' : '%'}
                  </button>
                ))}
              </div>
              <input type="number" min="0" placeholder="0" value={form.discount || ''}
                onChange={e => setForm(f => ({
                  ...f,
                  // Porcentaje: tope 100. Monto: nunca negativo (parseMoney).
                  discount: f.discountType === 'percent'
                    ? Math.min(100, parseMoney(e.target.value))
                    : parseMoney(e.target.value),
                }))}
                className="flex-1 bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Forma de pago</label>
            <div className="flex gap-2">
              {(['efectivo', 'mercadopago', 'transferencia'] as PaymentMethod[]).map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, paymentMethod: m }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${ form.paymentMethod === m ? 'bg-brand-600 text-white' : 'bg-black/5 text-ink-soft' }`}>
                  {PAYMENT_LABEL[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Paid / fiado */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">¿Está pagado?</label>
            <div className="flex gap-2">
              <button onClick={() => setForm(f => ({ ...f, paid: true }))}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${ form.paid !== false ? 'bg-emerald-600 text-white' : 'bg-black/5 text-ink-soft' }`}>
                Pagado
              </button>
              <button onClick={() => setForm(f => ({ ...f, paid: false }))}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${ form.paid === false ? 'bg-rose-500 text-white' : 'bg-black/5 text-ink-soft' }`}>
                Fiado (debe)
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Estado</label>
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'ready', 'completed'] as OrderStatus[]).map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${ form.status === s ? 'bg-brand-600 text-white' : 'bg-black/5 text-ink-soft' }`}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Fecha pedido</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Fecha entrega</label>
              <input type="date" value={form.dueDate ?? ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value || null }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Nota</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Detalles del pedido..." rows={3}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft resize-none" />
          </div>

          {/* Total */}
          {form.items.length > 0 && (
            <div className="bg-brand-600/5 rounded-xl p-3 space-y-1">
              {form.discount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Subtotal</span>
                    <span className="text-ink">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">Descuento</span>
                    <span className="text-red-500">-{form.discountType === 'percent' ? `${form.discount}%` : formatCurrency(discountAmt)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-bold">
                <span className="text-ink">Total</span>
                <span className="text-brand-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={saving || form.items.length === 0}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : form.items.length === 0 ? 'Agregá al menos un ítem' : (initial ? 'Guardar cambios' : 'Crear pedido')}
          </button>
        </div>
      </div>
    </div>
  )
}
