import { describe, it, expect } from 'vitest'
import { cartTotal, cartCount, normalizeWa, buildCartMessage, type CartLine } from './catalogCart'

const lines: CartLine[] = [
  { productId: 'p1', variantId: 'v1', name: 'Remera — M / Negro', price: 12000, qty: 2, maxStock: 5 },
  { productId: 'p2', variantId: null, name: 'Taza', price: 8000, qty: 1, maxStock: null },
]

describe('cartTotal / cartCount', () => {
  it('suma precios por cantidad', () => {
    expect(cartTotal(lines)).toBe(32000)
    expect(cartCount(lines)).toBe(3)
  })
})

describe('normalizeWa', () => {
  it('agrega prefijo 54 si falta', () => {
    expect(normalizeWa('2920123456')).toBe('542920123456')
  })
  it('respeta el prefijo existente', () => {
    expect(normalizeWa('5492920123456')).toBe('5492920123456')
  })
  it('limpia caracteres no numéricos', () => {
    expect(normalizeWa('+54 9 2920 12-3456')).toBe('5492920123456')
  })
  it('vacío queda vacío', () => {
    expect(normalizeWa('')).toBe('')
  })
})

describe('buildCartMessage', () => {
  it('arma el pedido con viñetas y total', () => {
    const msg = buildCartMessage('Tortas de Sofi', lines)
    expect(msg).toContain('*Tortas de Sofi*')
    expect(msg).toContain('• 2× Remera — M / Negro')
    expect(msg).toContain('• 1× Taza')
    expect(msg).toMatch(/\*Total: .*32\.000\*/)
  })
})
