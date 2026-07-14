import { useEffect, useState } from 'react'
import { Sprout, MessageCircle, PackageX, Plus, Minus, X, ShoppingCart, Clock, MapPin, Instagram, Music2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { APP_URL } from '@/lib/plan'
import { cartTotal, cartCount, cartWaLink, type CartLine } from '@/lib/catalogCart'
import type { ProductVariant } from '@/types'

interface CatalogBusiness {
  id: string
  name: string
  slug: string
  whatsapp: string
  currency: string
  description: string
  logoUrl: string | null
  hoursText: string
  instagram: string
  tiktok: string
  address: string
}

interface CatalogProduct {
  id: string
  name: string
  salePrice: number
  stock: number | null
  imageUrl: string | null
  variants: ProductVariant[] | null
}

// Página pública (sin login): brotaonline.com/tienda/<slug>
// Lee vía RPCs catalog_business/catalog_products que solo
// exponen columnas públicas (nunca costos ni datos de clientes)
export default function PublicCatalog({ slug }: { slug: string }) {
  const [business, setBusiness] = useState<CatalogBusiness | null>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading')
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`brota-cart-${slug}`) ?? '[]')
    } catch {
      return []
    }
  })
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    sessionStorage.setItem(`brota-cart-${slug}`, JSON.stringify(cart))
  }, [cart, slug])

  useEffect(() => {
    async function load() {
      // RPC por slug exacto: el catálogo no permite listar negocios ajenos
      const { data: bizRows } = await supabase.rpc('catalog_business', { p_slug: slug })
      const biz = Array.isArray(bizRows) ? bizRows[0] : bizRows
      if (!biz) { setState('notfound'); return }
      const b = biz as Record<string, string | null>
      setBusiness({
        id: b.id ?? '', name: b.name ?? '', slug: b.slug ?? '',
        whatsapp: b.whatsapp ?? '', currency: b.currency ?? 'ARS',
        description: b.description ?? '', logoUrl: b.logo_url ?? null,
        hoursText: b.hours_text ?? '', instagram: b.instagram ?? '',
        tiktok: b.tiktok ?? '', address: b.address ?? '',
      })

      const { data: prods } = await supabase.rpc('catalog_products', { p_slug: slug })
      setProducts(
        ((prods ?? []) as Record<string, unknown>[]).map((p) => ({
          id: p.id as string,
          name: p.name as string,
          salePrice: Number(p.sale_price),
          stock: p.stock === null ? null : Number(p.stock),
          imageUrl: (p.image_url as string | null) ?? null,
          variants: (p.variants as ProductVariant[] | null) ?? null,
        }))
      )
      setState('ok')
    }
    load()
  }, [slug])

  function addLine(p: CatalogProduct, v: ProductVariant | null) {
    const variantId = v?.id ?? null
    const maxStock = v ? v.stock : p.stock
    setCart((c) => {
      const existing = c.find((l) => l.productId === p.id && l.variantId === variantId)
      if (existing) {
        return c.map((l) =>
          l === existing
            ? { ...l, qty: maxStock === null ? l.qty + 1 : Math.min(maxStock, l.qty + 1) }
            : l
        )
      }
      return [...c, {
        productId: p.id,
        variantId,
        name: v ? `${p.name} — ${v.name}` : p.name,
        price: v?.salePrice ?? p.salePrice,
        qty: 1,
        maxStock,
      }]
    })
  }

  function changeQty(line: CartLine, delta: number) {
    setCart((c) =>
      c
        .map((l) => {
          if (l !== line) return l
          const next = l.qty + delta
          if (l.maxStock !== null && next > l.maxStock) return l
          return { ...l, qty: next }
        })
        .filter((l) => l.qty > 0)
    )
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-cream">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (state === 'notfound' || !business) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-cream px-6 text-center gap-3">
        <PackageX size={40} className="text-ink-soft" />
        <p className="font-semibold text-ink">Este catálogo no existe</p>
        <a href={APP_URL} className="text-brand-600 text-sm font-medium underline">Ir a Brota</a>
      </div>
    )
  }

  const canOrder = !!business.whatsapp
  const count = cartCount(cart)

  return (
    <div className="min-h-full bg-cream">
      <div className="max-w-lg mx-auto pb-10">
        <header className="flex flex-col items-center pt-10 pb-6 px-4 text-center">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.name} className="w-20 h-20 rounded-2xl object-cover mb-3 shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg">
              <Sprout size={30} color="white" strokeWidth={2} />
            </div>
          )}
          <h1 className="text-2xl font-bold text-ink">{business.name}</h1>
          {business.description ? (
            <p className="text-ink-soft text-sm mt-1 max-w-xs leading-relaxed">{business.description}</p>
          ) : (
            <p className="text-ink-soft text-sm mt-1">Catálogo online</p>
          )}

          {(business.hoursText || business.address) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {business.hoursText && (
                <span className="inline-flex items-center gap-1.5 bg-surface rounded-full px-3 py-1.5 text-xs text-ink-soft shadow-sm">
                  <Clock size={12} /> {business.hoursText}
                </span>
              )}
              {business.address && (
                <span className="inline-flex items-center gap-1.5 bg-surface rounded-full px-3 py-1.5 text-xs text-ink-soft shadow-sm">
                  <MapPin size={12} /> {business.address}
                </span>
              )}
            </div>
          )}

          {(business.instagram || business.tiktok) && (
            <div className="flex items-center gap-2 mt-3">
              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram.replace(/^@/, '')}`}
                  target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-surface shadow-sm flex items-center justify-center text-ink-soft"
                >
                  <Instagram size={16} />
                </a>
              )}
              {business.tiktok && (
                <a
                  href={`https://tiktok.com/@${business.tiktok.replace(/^@/, '')}`}
                  target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-surface shadow-sm flex items-center justify-center text-ink-soft"
                >
                  <Music2 size={16} />
                </a>
              )}
            </div>
          )}
        </header>

        <div className="px-4 space-y-2">
          {products.length === 0 && (
            <p className="text-center text-ink-soft text-sm py-10">Todavía no hay productos cargados.</p>
          )}
          {products.map((p) => (
            <CatalogCard key={p.id} product={p} canOrder={canOrder} onAdd={addLine} />
          ))}
        </div>

        <footer className="text-center mt-10 px-4">
          <a href={APP_URL} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
            Catálogo creado con <span className="font-bold text-brand-600">Brota 🌱</span> — creá el tuyo gratis
          </a>
        </footer>
      </div>

      {/* Barra flotante del carrito */}
      {canOrder && count > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-brand-600 text-white rounded-2xl px-5 py-3.5 shadow-lg flex items-center justify-between z-40"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart size={17} /> {count} ítem{count !== 1 ? 's' : ''} · {formatCurrency(cartTotal(cart))}
          </span>
          <span className="text-sm font-bold">Ver pedido →</span>
        </button>
      )}

      {/* Sheet del pedido */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative bg-surface rounded-t-3xl max-h-[85vh] flex flex-col max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
              <h2 className="font-bold text-ink text-lg">Tu pedido</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
                <X size={16} className="text-ink" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-2">
              {cart.map((l) => (
                <div key={`${l.productId}:${l.variantId ?? ''}`} className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium truncate">{l.name}</p>
                    <p className="text-xs text-ink-soft">{formatCurrency(l.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => changeQty(l, -1)} className="w-7 h-7 rounded-lg bg-surface shadow-sm flex items-center justify-center text-ink">
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-semibold text-ink w-5 text-center">{l.qty}</span>
                    <button
                      onClick={() => changeQty(l, 1)}
                      disabled={l.maxStock !== null && l.qty >= l.maxStock}
                      className="w-7 h-7 rounded-lg bg-surface shadow-sm flex items-center justify-center text-ink disabled:opacity-40"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-ink-soft text-sm py-8">Tu pedido está vacío.</p>
              )}
            </div>
            <div className="p-5 pt-3 border-t border-black/5 shrink-0 pb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-ink-soft">Total</span>
                <span className="text-lg font-bold text-ink">{formatCurrency(cartTotal(cart))}</span>
              </div>
              <a
                href={cart.length > 0 ? cartWaLink(business.whatsapp, business.name, cart) : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowCart(false)}
                className={`flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white font-semibold rounded-2xl text-sm ${cart.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <MessageCircle size={16} /> Enviar pedido por WhatsApp
              </a>
              <p className="text-[11px] text-ink-soft text-center mt-2">
                El pedido se confirma directo con el negocio por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CatalogCard({
  product: p, canOrder, onAdd,
}: {
  product: CatalogProduct
  canOrder: boolean
  onAdd: (p: CatalogProduct, v: ProductVariant | null) => void
}) {
  const [variantId, setVariantId] = useState('')
  const hasVariants = !!p.variants?.length
  const variant = p.variants?.find((v) => v.id === variantId) ?? null

  // Sin stock: producto simple agotado, o todas las variantes con control en 0
  const out = hasVariants
    ? p.variants!.every((v) => v.stock !== null && v.stock <= 0)
    : p.stock !== null && p.stock <= 0
  const variantOut = variant ? variant.stock !== null && variant.stock <= 0 : false

  // "Desde $X" cuando hay variantes con precios distintos
  const prices = hasVariants
    ? [...new Set(p.variants!.map((v) => v.salePrice ?? p.salePrice))]
    : [p.salePrice]
  const priceLabel = variant
    ? formatCurrency(variant.salePrice ?? p.salePrice)
    : prices.length > 1
      ? `Desde ${formatCurrency(Math.min(...prices))}`
      : formatCurrency(prices[0])

  return (
    <div className="bg-surface rounded-2xl p-3 shadow-sm">
      <div className="flex items-center gap-3">
        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt={p.name}
            loading="lazy"
            className={`w-16 h-16 rounded-xl object-cover shrink-0 ${out ? 'grayscale opacity-60' : ''}`}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink">{p.name}</p>
          <p className="text-brand-600 font-bold text-sm mt-0.5">{priceLabel}</p>
          {out && (
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
              Sin stock
            </span>
          )}
        </div>
        {canOrder && !out && !hasVariants && (
          <button
            onClick={() => onAdd(p, null)}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shrink-0"
          >
            <Plus size={14} /> Agregar
          </button>
        )}
      </div>

      {canOrder && !out && hasVariants && (
        <div className="flex items-center gap-2 mt-2.5">
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="flex-1 bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink"
          >
            <option value="">Elegí una opción...</option>
            {p.variants!.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock !== null && v.stock <= 0}>
                {v.name}{v.stock !== null && v.stock <= 0 ? ' (sin stock)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => variant && onAdd(p, variant)}
            disabled={!variant || variantOut}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shrink-0 disabled:opacity-50"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
      )}
    </div>
  )
}
