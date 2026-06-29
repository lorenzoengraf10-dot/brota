import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Package, Pencil } from 'lucide-react'
import { useProductsStore } from '@/store/useProductsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isAtLimit } from '@/lib/plans'
import UpgradeModal from './UpgradeModal'
import type { Product } from '@/types'

export default function Products() {
  const { user } = useAuthStore()
  const { products, loading, fetch, add, update, remove } = useProductsStore()
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) fetch(user.id) }, [user])

  const openNew = () => {
    if (isAtLimit(user?.plan ?? 'free', 'products', products.length)) {
      setShowUpgrade(true)
      return
    }
    setEditing(null); setName(''); setPrice(''); setCost(''); setStock(''); setCategory('')
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setName(p.name); setPrice(String(p.price)); setCost(String(p.cost ?? ''))
    setStock(String(p.stock ?? '')); setCategory(p.category ?? '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!user || !name.trim() || !price) return
    setSaving(true)
    const payload = {
      userId: user.id,
      name: name.trim(),
      price: Number(price),
      cost: cost ? Number(cost) : undefined,
      stock: stock ? Number(stock) : undefined,
      category: category || undefined,
      active: true,
    }
    if (editing) {
      await update(editing.id, payload)
    } else {
      await add(payload)
    }
    setShowForm(false)
    setSaving(false)
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Productos</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1 px-3 py-2 bg-[#059669] text-white text-sm font-medium rounded-xl"
        >
          <Plus size={16} /> Agregar
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
                <h3 className="font-bold text-lg">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre*"
                  className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    type="number" placeholder="Precio de venta*"
                    className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                  />
                  <input
                    value={cost} onChange={(e) => setCost(e.target.value)}
                    type="number" placeholder="Costo"
                    className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={stock} onChange={(e) => setStock(e.target.value)}
                    type="number" placeholder="Stock"
                    className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                  />
                  <input
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    placeholder="Categoría"
                    className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !name || !price}
                  className="w-full py-3 bg-[#059669] text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar producto'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={48} className="mx-auto opacity-30" />
          <p className="mt-2 text-sm">Sin productos cargados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#e5e0d5] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f6f2e8] flex items-center justify-center">
                <Package size={18} className="text-[#059669]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-400">
                  {p.category ?? 'Sin categoría'}{p.stock !== undefined ? ` · Stock: ${p.stock}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#059669] text-sm">{fmt(p.price)}</p>
                {p.cost !== undefined && <p className="text-xs text-gray-400">Costo: {fmt(p.cost)}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#f6f2e8]">
                  <Pencil size={14} className="text-gray-400" />
                </button>
                <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-rose-50">
                  <X size={14} className="text-rose-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </motion.div>
  )
}
