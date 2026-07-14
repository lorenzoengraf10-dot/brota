import { describe, it, expect } from 'vitest'
import { totalStock, isLowStock } from './stock'
import type { Product } from '@/types'

function product(patch: Partial<Product>): Product {
  return {
    id: 'p1', businessId: 'b1', name: 'Remera',
    costPrice: 0, salePrice: 100, stock: null, createdAt: '',
    ...patch,
  }
}

const variant = (id: string, stock: number | null) => ({
  id, name: id, salePrice: null, costPrice: null, stock,
})

describe('totalStock', () => {
  it('producto sin control devuelve null', () => {
    expect(totalStock(product({ stock: null }))).toBe(null)
  })
  it('producto simple devuelve su stock', () => {
    expect(totalStock(product({ stock: 7 }))).toBe(7)
  })
  it('con variantes suma las que tienen control', () => {
    expect(totalStock(product({ variants: [variant('a', 2), variant('b', 3), variant('c', null)] }))).toBe(5)
  })
  it('variantes todas sin control devuelve null', () => {
    expect(totalStock(product({ variants: [variant('a', null)] }))).toBe(null)
  })
})

describe('isLowStock', () => {
  it('sin umbral nunca alerta', () => {
    expect(isLowStock(product({ stock: 0 }))).toBe(false)
  })
  it('alerta cuando stock <= umbral', () => {
    expect(isLowStock(product({ stock: 3, lowStockThreshold: 3 }))).toBe(true)
    expect(isLowStock(product({ stock: 4, lowStockThreshold: 3 }))).toBe(false)
  })
  it('suma variantes contra el umbral', () => {
    expect(isLowStock(product({ variants: [variant('a', 1), variant('b', 1)], lowStockThreshold: 2 }))).toBe(true)
  })
  it('sin control de stock no alerta aunque haya umbral', () => {
    expect(isLowStock(product({ stock: null, lowStockThreshold: 3 }))).toBe(false)
  })
})
