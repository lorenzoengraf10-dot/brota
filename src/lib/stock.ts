import type { Product } from '@/types'

// Stock total de un producto: suma de variantes con control, o el global.
// null = sin control de stock.
export function totalStock(p: Product): number | null {
  if (p.variants?.length) {
    const tracked = p.variants.filter((v) => v.stock !== null)
    if (tracked.length === 0) return null
    return tracked.reduce((s, v) => s + (v.stock ?? 0), 0)
  }
  return p.stock
}

// ¿Está por agotarse? (stock total <= umbral configurado)
export function isLowStock(p: Product): boolean {
  if (p.lowStockThreshold == null) return false
  const stock = totalStock(p)
  return stock !== null && stock <= p.lowStockThreshold
}
