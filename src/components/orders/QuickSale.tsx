import { useMemo, useState } from 'react'
import { X, Package, Plus, Minus, Zap, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, today } from '@/lib/format'
import { trackEvent } from '@/lib/gaTracking'
import type { PaymentMethod, Product, ProductVariant, OrderItem } from '@/types'

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'mercadopago', label: 'MP' },
  { id: 'transferencia', label: 'Transf.' },
]

interface Line {
  product: Product
  variant: ProductVariant | null
  qty: number
}

function lineKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? ''}`
}

// Venta de mostrador en 2 toques: tocar producto → Cobrar.
// Crea un pedido ya entregado y pagado, sin cliente.
export default function QuickSale({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, business, addOrder } = useStore()
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState<Map<string, Line>>(new Map())
  const [payment, setPayment] = useState<PaymentMethod>('efectivo')
  const [variantPicker, setVariantPicker] = useState<Product | null>(null)
  const [charging, setCharging] = useState(false)
  const [done, setDone] = useState(false)

  const filtered = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

  // Derivados del ticket: solo se recalculan cuando cambian las líneas,
  // no en cada tecleo del buscador (que cambia `search`, no `lines`).
  const { total, count, qtyByProduct } = useMemo(() => {
    let total = 0
    let count = 0
    const qtyByProduct = new Map<string, number>()
    for (const l of lines.values()) {
      total += (l.variant?.salePrice ?? l.product.salePrice) * l.qty
      count += l.qty
      qtyByProduct.set(l.product.id, (qtyByProduct.get(l.product.id) ?? 0) + l.qty)
    }
    return { total, count, qtyByProduct }
  }, [lines])

  if (!open) return null

  function bump(product: Product, variant: ProductVariant | null, delta: number) {
    setLines(prev => {
      const next = new Map(prev)
      const key = lineKey(product.id, variant?.id ?? null)
      const line = next.get(key) ?? { product, variant, qty: 0 }
      const stock = variant ? variant.stock : product.stock
      const qty = Math.max(0, stock === null ? line.qty + delta : Math.min(stock, line.qty + delta))
      if (qty === 0) next.delete(key)
      else next.set(key, { ...line, qty })
      return next
    })
  }

  function tapProduct(p: Product) {
    if (p.variants?.length) { setVariantPicker(p); return }
    bump(p, null, 1)
  }

  async function charge() {
    if (!business || lines.size === 0 || charging) return
    setCharging(true)
    const items: OrderItem[] = [...lines.values()].map(l => ({
      productId: l.product.id,
      name: l.variant ? `${l.product.name} — ${l.variant.name}` : l.product.name,
      quantity: l.qty,
      unitSalePrice: l.variant?.salePrice ?? l.product.salePrice,
      unitCostPrice: l.variant?.costPrice ?? l.product.costPrice,
      variantId: l.variant?.id ?? null,
    }))
    await addOrder({
      businessId: business.id,
      customerId: null,
      customerName: '',
      items,
      discount: 0,
      discountType: 'amount',
      status: 'completed',
      dueDate: null,
      date: today(),
      note: '',
      paymentMethod: payment,
      paid: true,
    })
    trackEvent('quick_sale', { items: items.length, total })
    setLines(new Map())
    setCharging(false)
    setDone(true)
    setTimeout(() => setDone(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream rounded-t-3xl sm:rounded-3xl h-[92vh] sm:h-[85vh] flex flex-col max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between p-5 pb-3 shrink-0">
          <h2 className="font-bold text-ink text-lg flex items-center gap-2">
            <Zap size={18} className="text-brand-600" /> Venta rápida
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="px-5 pb-3 shrink-0">
          <input
            type="text" placeholder="Buscar producto..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft shadow-sm"
          />
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-4">
          {filtered.length === 0 && (
            <p className="text-center text-ink-soft text-sm py-10">
              {products.length === 0 ? 'Cargá productos para vender más rápido.' : 'Sin resultados.'}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(p => {
              // Cantidad total de este producto en el ticket (todas las variantes)
              const inCart = qtyByProduct.get(p.id) ?? 0
              const out = !p.variants?.length && p.stock !== null && p.stock <= 0
              return (
                <button
                  key={p.id}
                  onClick={() => !out && tapProduct(p)}
                  disabled={out}
                  className={`relative bg-surface rounded-2xl p-3 shadow-sm text-left active:scale-[0.97] transition-transform ${out ? 'opacity-50' : ''}`}
                >
                  {inCart > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-6 h-6 px-1.5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                      {inCart}
                    </span>
                  )}
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover mb-2" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-azure-600/10 flex items-center justify-center mb-2">
                      <Package size={16} className="text-azure-600" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-ink leading-tight line-clamp-2">{p.name}</p>
                  <p className="text-xs text-brand-600 font-bold mt-0.5">
                    {p.variants?.length ? 'Elegir opción' : formatCurrency(p.salePrice)}
                  </p>
                  {out && <p className="text-[10px] text-ink-soft mt-0.5">Sin stock</p>}
                </button>
              )
            })}
          </div>

          {/* Líneas del ticket con stepper */}
          {lines.size > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Ticket</p>
              {[...lines.entries()].map(([key, l]) => (
                <div key={key} className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">
                      {l.variant ? `${l.product.name} — ${l.variant.name}` : l.product.name}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {formatCurrency(l.variant?.salePrice ?? l.product.salePrice)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => bump(l.product, l.variant, -1)} className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-ink">
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-semibold text-ink w-5 text-center">{l.qty}</span>
                    <button onClick={() => bump(l.product, l.variant, 1)} className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-ink">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barra de cobro */}
        <div className="shrink-0 bg-surface border-t border-black/5 p-4 pb-8 space-y-3">
          <div className="flex rounded-xl overflow-hidden border border-black/10">
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPayment(opt.id)}
                className={`flex-1 py-2 text-xs font-semibold ${payment === opt.id ? 'bg-brand-600 text-white' : 'bg-surface text-ink-soft'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={charge}
            disabled={count === 0 || charging}
            className={`w-full py-3.5 font-bold rounded-2xl text-base flex items-center justify-center gap-2 transition-colors ${
              done ? 'bg-emerald-500 text-white' : 'bg-brand-600 text-white disabled:opacity-40'
            }`}
          >
            {done ? (<><Check size={18} /> ¡Venta registrada!</>) : `Cobrar ${formatCurrency(total)}`}
          </button>
        </div>

        {/* Mini-picker de variante */}
        {variantPicker && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 rounded-t-3xl" onClick={() => setVariantPicker(null)} />
            <div className="relative bg-surface rounded-t-3xl p-5 pb-8">
              <p className="font-bold text-ink mb-3">{variantPicker.name}</p>
              <div className="space-y-1.5">
                {(variantPicker.variants ?? []).map(v => {
                  const vOut = v.stock !== null && v.stock <= 0
                  return (
                    <button
                      key={v.id}
                      disabled={vOut}
                      onClick={() => { bump(variantPicker, v, 1); setVariantPicker(null) }}
                      className="w-full flex items-center justify-between bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2.5 disabled:opacity-40"
                    >
                      <span className="text-sm text-ink font-medium">{v.name}</span>
                      <span className="text-sm text-brand-600 font-bold">
                        {vOut ? 'Sin stock' : formatCurrency(v.salePrice ?? variantPicker.salePrice)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
