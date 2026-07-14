import { useState, useRef } from 'react'
import { Plus, X, Pencil, Trash2, Package, Camera, Loader2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatCurrency, parseMoney, parseCount } from '@/lib/format'
import { isAtLimit, FREE_LIMITS, LAUNCH_FREE } from '@/lib/plan'
import { uploadProductImage } from '@/lib/images'
import { trackEvent } from '@/lib/gaTracking'
import UpgradeModal from '@/components/plan/UpgradeModal'
import type { Product } from '@/types'

function emptyProduct(businessId: string): Omit<Product, 'id' | 'createdAt'> {
  return { businessId, name: '', costPrice: 0, salePrice: 0, stock: null, imageUrl: null }
}

export default function Products() {
  const { products, business, user, addProduct, updateProduct, deleteProduct } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const atLimit = isAtLimit(user?.plan ?? 'free', 'products', products.length)

  function openNew() {
    if (atLimit) { setShowUpgrade(true); return }
    setEditing(null)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (confirm('¿Eliminar este producto?')) await deleteProduct(id)
  }

  return (
    <div className="pb-24">
      <div className="p-4">
        <input
          type="text" placeholder="Buscar producto..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface rounded-2xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft shadow-sm"
        />
      </div>

      {!LAUNCH_FREE && user?.plan === 'free' && (
        <div className="px-4 mb-3">
          <div className="bg-surface rounded-2xl p-3 flex items-center justify-between">
            <p className="text-xs text-ink-soft">{products.length}/{FREE_LIMITS.products} productos (plan gratuito)</p>
            <button onClick={() => setShowUpgrade(true)} className="text-xs text-brand-600 font-semibold">Actualizar</button>
          </div>
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-azure-600/10 flex items-center justify-center">
              <Package size={24} className="text-azure-600" />
            </span>
            <p className="text-ink-soft text-sm">{search ? 'Sin resultados.' : 'Todavía no tenés productos.'}</p>
            {!search && (
              <button onClick={openNew} className="text-brand-600 font-medium text-sm">+ Agregar producto</button>
            )}
          </div>
        )}

        {filtered.map(product => {
          const margin = product.costPrice > 0
            ? Math.round(((product.salePrice - product.costPrice) / product.salePrice) * 100)
            : null
          return (
            <div key={product.id} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-azure-600/10 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-azure-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{product.name}</p>
                <p className="text-xs text-ink-soft">
                  Venta: {formatCurrency(product.salePrice)}
                  {product.costPrice > 0 && ` · Costo: ${formatCurrency(product.costPrice)}`}
                  {margin !== null && ` · Margen: ${margin}%`}
                </p>
                <p className="text-xs text-ink-soft">
                  {product.stock === null ? 'Sin control de stock' : `Stock: ${product.stock}`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setEditing(product); setShowForm(true) }}
                  className="p-2 rounded-xl bg-black/5 text-ink-soft"
                >
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="p-2 rounded-xl bg-red-50 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-600 text-white rounded-2xl shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {showForm && (
        <ProductForm
          initial={editing}
          businessId={business?.id ?? ''}
          onClose={() => setShowForm(false)}
          onSave={async data => {
            if (editing) await updateProduct(editing.id, data)
            else { await addProduct(data as Omit<Product, 'id' | 'createdAt'>); trackEvent('product_created') }
            setShowForm(false)
          }}
        />
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function ProductForm({
  initial, businessId, onClose, onSave,
}: {
  initial: Product | null
  businessId: string
  onClose: () => void
  onSave: (data: Partial<Product>) => Promise<void>
}) {
  const [form, setForm] = useState(() =>
    initial
      ? { name: initial.name, costPrice: initial.costPrice, salePrice: initial.salePrice, stock: initial.stock, imageUrl: initial.imageUrl ?? null, businessId: initial.businessId }
      : emptyProduct(businessId)
  )
  const [saving, setSaving] = useState(false)
  const [hasStock, setHasStock] = useState(initial ? initial.stock !== null : false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError(false)
    const url = await uploadProductImage(businessId, file)
    setUploading(false)
    if (url) setForm(f => ({ ...f, imageUrl: url }))
    else setUploadError(true)
  }

  const margin = form.costPrice > 0 && form.salePrice > 0
    ? Math.round(((form.salePrice - form.costPrice) / form.salePrice) * 100)
    : null

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, stock: hasStock ? (form.stock ?? 0) : null })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
          <h2 className="font-bold text-ink text-lg">{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
            <X size={16} className="text-ink" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5 pb-8">
          {/* Foto para el catálogo */}
          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Foto (para tu catálogo)</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickPhoto} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0"
              >
                {uploading ? (
                  <Loader2 size={22} className="text-ink-soft animate-spin" />
                ) : form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} className="text-ink-soft" />
                )}
              </button>
              <div className="flex-1">
                <p className="text-xs text-ink-soft">
                  {form.imageUrl ? 'Tocá la foto para cambiarla.' : 'Opcional. Se muestra en tu catálogo online.'}
                </p>
                {form.imageUrl && (
                  <button onClick={() => setForm(f => ({ ...f, imageUrl: null }))} className="text-xs text-red-500 font-medium mt-1">
                    Quitar foto
                  </button>
                )}
                {uploadError && (
                  <p className="text-xs text-amber-600 mt-1">No se pudo subir. Las fotos necesitan conexión.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Nombre</label>
            <input type="text" placeholder="Nombre del producto" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-soft" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Precio de venta</label>
              <input type="number" min="0" placeholder="0" value={form.salePrice || ''}
                onChange={e => setForm(f => ({ ...f, salePrice: parseMoney(e.target.value) }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide block mb-2">Precio de costo</label>
              <input type="number" min="0" placeholder="0" value={form.costPrice || ''}
                onChange={e => setForm(f => ({ ...f, costPrice: parseMoney(e.target.value) }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            </div>
          </div>

          {margin !== null && (
            <div className={`rounded-xl p-3 text-sm text-center font-medium ${ margin >= 0 ? 'bg-brand-600/10 text-brand-600' : 'bg-red-50 text-red-500' }`}>
              Margen: {margin}% · Ganancia por unidad: {formatCurrency(form.salePrice - form.costPrice)}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Control de stock</label>
              <button
                onClick={() => setHasStock(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors ${ hasStock ? 'bg-brand-600' : 'bg-black/20' }`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white shadow m-0.5 transition-transform ${ hasStock ? 'translate-x-5' : '' }`} />
              </button>
            </div>
            {hasStock && (
              <input type="number" min="0" placeholder="0" value={form.stock ?? ''}
                onChange={e => setForm(f => ({ ...f, stock: parseCount(e.target.value) }))}
                className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink" />
            )}
          </div>

          <button onClick={handleSave} disabled={saving || uploading}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50">
            {saving ? 'Guardando...' : uploading ? 'Subiendo foto...' : (initial ? 'Guardar cambios' : 'Agregar producto')}
          </button>
        </div>
      </div>
    </div>
  )
}
