import { describe, it, expect } from 'vitest'
import { orderTotal, orderSubtotal } from './receipt'
import type { Order } from '@/types'

function order(patch: Partial<Order>): Order {
  return {
    id: 'o1', businessId: 'b1', customerId: null, customerName: '',
    items: [], discount: 0, discountType: 'amount', status: 'pending',
    dueDate: null, date: '2026-01-01', note: '', paymentMethod: 'efectivo',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...patch,
  }
}

const item = (salePrice: number, qty: number) =>
  ({ productId: 'p1', name: 'Producto', quantity: qty, unitSalePrice: salePrice, unitCostPrice: 0 })

describe('orderTotal', () => {
  it('sin descuento: es la suma de los ítems', () => {
    const o = order({ items: [item(1000, 2), item(500, 1)] })
    expect(orderSubtotal(o)).toBe(2500)
    expect(orderTotal(o)).toBe(2500)
  })

  it('con descuento en monto fijo', () => {
    const o = order({ items: [item(1000, 2)], discount: 300, discountType: 'amount' })
    expect(orderTotal(o)).toBe(1700)
  })

  it('con descuento en porcentaje', () => {
    const o = order({ items: [item(1000, 2)], discount: 10, discountType: 'percent' })
    expect(orderTotal(o)).toBe(1800)
  })

  it('pedido sin ítems: total 0', () => {
    const o = order({ items: [] })
    expect(orderTotal(o)).toBe(0)
  })

  it('descuento mayor al subtotal nunca da negativo', () => {
    const o = order({ items: [item(100, 1)], discount: 500, discountType: 'amount' })
    expect(orderTotal(o)).toBe(0)
  })

  it('descuento porcentual mayor a 100% tampoco da negativo', () => {
    const o = order({ items: [item(100, 1)], discount: 150, discountType: 'percent' })
    expect(orderTotal(o)).toBe(0)
  })
})
