import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStore } from './useStore'
import type { Product, Business } from '@/types'

// Nunca queremos que un test le pegue a la Supabase real: mockeamos el
// módulo entero. flushQueue() en los tests corre "offline" (ver
// vitest.setup.ts), así que en la práctica estos mocks ni se llaman —
// pero quedan acá por si algún día se testea la sync online.
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

const business: Business = { id: 'b1', name: 'Demo', currency: 'ARS', createdAt: '2026-01-01T00:00:00.000Z' }

function seedProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1', businessId: 'b1', name: 'Torta', costPrice: 4000, salePrice: 9000,
    stock: 10, imageUrl: null, variants: null, lowStockThreshold: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function baseOrder(qty: number) {
  return {
    businessId: 'b1', customerId: null, customerName: '',
    items: [{ productId: 'p1', name: 'Torta', quantity: qty, unitSalePrice: 9000, unitCostPrice: 4000 }],
    discount: 0, discountType: 'amount' as const, status: 'completed' as const,
    dueDate: null, date: '2026-01-05', note: '', paymentMethod: 'efectivo' as const, paid: true,
  }
}

describe('applyStock (vía addOrder)', () => {
  // Zustand no se resetea solo entre tests: pisamos el estado a mano.
  // useStore.getState() te da las acciones + datos actuales sin envolver
  // nada en un componente React — es lo lindo de testear un store así.
  beforeEach(() => {
    useStore.setState({ business, businesses: [business], products: [seedProduct()], orders: [], pendingOps: [] })
  })

  it('descuenta stock al vender un producto con control de stock', async () => {
    await useStore.getState().addOrder(baseOrder(3))

    const product = useStore.getState().products.find((p) => p.id === 'p1')
    expect(product?.stock).toBe(7)
  })

  it('no toca el stock si el producto no tiene control (stock null)', async () => {
    useStore.setState({ products: [seedProduct({ stock: null })] })

    await useStore.getState().addOrder(baseOrder(2))

    const product = useStore.getState().products.find((p) => p.id === 'p1')
    expect(product?.stock).toBeNull()
  })

  it('nunca deja el stock en negativo', async () => {
    useStore.setState({ products: [seedProduct({ stock: 1 })] })

    await useStore.getState().addOrder(baseOrder(5))

    const product = useStore.getState().products.find((p) => p.id === 'p1')
    expect(product?.stock).toBe(0)
  })

  it('al borrar el pedido, repone el stock vendido', async () => {
    await useStore.getState().addOrder(baseOrder(3))
    const created = useStore.getState().orders[0]

    await useStore.getState().deleteOrder(created.id)

    const product = useStore.getState().products.find((p) => p.id === 'p1')
    expect(product?.stock).toBe(10)
  })
})
