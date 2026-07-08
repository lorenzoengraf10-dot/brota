import { useEffect, useState } from 'react'
import { Sprout, MessageCircle, PackageX } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { APP_URL } from '@/lib/plan'

interface CatalogBusiness {
  id: string
  name: string
  slug: string
  whatsapp: string
  currency: string
}

interface CatalogProduct {
  id: string
  name: string
  salePrice: number
  stock: number | null
}

// Página pública (sin login): brotaonline.com/tienda/<slug>
// Lee de las vistas catalog_businesses/catalog_products que solo
// exponen columnas públicas (nunca costos ni datos de clientes)
export default function PublicCatalog({ slug }: { slug: string }) {
  const [business, setBusiness] = useState<CatalogBusiness | null>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading')

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase
        .from('catalog_businesses')
        .select('*')
        .eq('slug', slug)
        .single()
      if (!biz) { setState('notfound'); return }
      const b = biz as Record<string, string>
      setBusiness({ id: b.id, name: b.name, slug: b.slug, whatsapp: b.whatsapp ?? '', currency: b.currency })

      const { data: prods } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('business_id', b.id)
        .order('name')
      setProducts(
        ((prods ?? []) as Record<string, unknown>[]).map((p) => ({
          id: p.id as string,
          name: p.name as string,
          salePrice: Number(p.sale_price),
          stock: p.stock === null ? null : Number(p.stock),
        }))
      )
      setState('ok')
    }
    load()
  }, [slug])

  function orderLink(p: CatalogProduct): string {
    const msg = `Hola! Quiero pedir *${p.name}* (${formatCurrency(p.salePrice)}) — lo vi en tu catálogo 🌱`
    const clean = (business?.whatsapp ?? '').replace(/\D/g, '')
    const num = clean ? (clean.startsWith('54') ? clean : `54${clean}`) : ''
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
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

  return (
    <div className="min-h-full bg-cream">
      <div className="max-w-lg mx-auto pb-10">
        <header className="flex flex-col items-center pt-10 pb-6 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg">
            <Sprout size={30} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-ink">{business.name}</h1>
          <p className="text-ink-soft text-sm mt-1">Catálogo online</p>
        </header>

        <div className="px-4 space-y-2">
          {products.length === 0 && (
            <p className="text-center text-ink-soft text-sm py-10">Todavía no hay productos cargados.</p>
          )}
          {products.map((p) => {
            const out = p.stock !== null && p.stock <= 0
            return (
              <div key={p.id} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-brand-600 font-bold text-sm mt-0.5">{formatCurrency(p.salePrice)}</p>
                  {out && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      Sin stock
                    </span>
                  )}
                </div>
                {business.whatsapp && !out && (
                  <a
                    href={orderLink(p)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shrink-0"
                  >
                    <MessageCircle size={14} /> Pedir
                  </a>
                )}
              </div>
            )
          })}
        </div>

        <footer className="text-center mt-10 px-4">
          <a href={APP_URL} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
            Catálogo creado con <span className="font-bold text-brand-600">Brota 🌱</span> — creá el tuyo gratis
          </a>
        </footer>
      </div>
    </div>
  )
}
