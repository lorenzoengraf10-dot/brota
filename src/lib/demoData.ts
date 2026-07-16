import { today, toLocalISO, isoWeekStart } from './format'
import type {
  AppUser, Business, Product, Customer, CustomerGroup,
  Order, Expense, Appointment, SocialMetric,
} from '@/types'

// Datos de ejemplo para el modo demo (VITE_DEMO_MODE=true): permiten ver
// todas las pantallas con contenido realista sin tocar ningún backend.
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toLocalISO(d)
}
function daysFromNow(n: number): string {
  return daysAgo(-n)
}

export interface DemoSeed {
  user: AppUser
  business: Business
  products: Product[]
  customers: Customer[]
  customerGroups: CustomerGroup[]
  orders: Order[]
  expenses: Expense[]
  appointments: Appointment[]
  socialMetrics: SocialMetric[]
}

export function buildDemoSeed(): DemoSeed {
  const businessId = 'demo-business'
  const now = new Date().toISOString()

  const business: Business = {
    id: businessId,
    name: 'Tortas de Sofi',
    currency: 'ARS',
    slug: null,
    whatsapp: '5491100000000',
    description: 'Tortas y postres artesanales para eventos, hechos con amor 🍰',
    logoUrl: null,
    hoursText: 'Lun a Sáb 10 a 19hs',
    instagram: 'tortasdesofi',
    tiktok: '',
    address: 'Villa La Angostura, Neuquén',
    createdAt: now,
  }

  const user: AppUser = {
    id: 'demo-user',
    email: 'demo@brota.app',
    plan: 'free',
    isFounder: true,
    businessId,
  }

  const groupVip: CustomerGroup = { id: 'demo-group-vip', businessId, name: 'Clientes VIP', color: '#d97706', createdAt: now }
  const groupEventos: CustomerGroup = { id: 'demo-group-eventos', businessId, name: 'Eventos', color: '#7c3aed', createdAt: now }
  const customerGroups = [groupVip, groupEventos]

  const customers: Customer[] = [
    { id: 'demo-c1', businessId, name: 'Marina Gómez', phone: '5492920111111', age: 34, sex: 'F', groupId: groupVip.id, notes: 'Pide todos los meses', createdAt: now },
    { id: 'demo-c2', businessId, name: 'Julián Pérez', phone: '5492920222222', age: 29, sex: 'M', groupId: groupEventos.id, notes: 'Cumpleaños de su hija en diciembre', createdAt: now },
    { id: 'demo-c3', businessId, name: 'Rocío Fernández', phone: '5492920333333', age: 41, sex: 'F', groupId: null, notes: '', createdAt: now },
    { id: 'demo-c4', businessId, name: 'Tomás Ibáñez', phone: '', age: null, sex: '', groupId: null, notes: 'Cliente ocasional, sin teléfono', createdAt: now },
  ]

  const products: Product[] = [
    {
      id: 'demo-p1', businessId, name: 'Torta de chocolate', costPrice: 4500, salePrice: 9000,
      stock: null, imageUrl: null, variants: null, lowStockThreshold: null, createdAt: now,
    },
    {
      id: 'demo-p2', businessId, name: 'Cupcakes (docena)', costPrice: 2200, salePrice: 5500,
      stock: 8, imageUrl: null, variants: null, lowStockThreshold: 5, createdAt: now,
    },
    {
      id: 'demo-p3', businessId, name: 'Alfajores de maicena', costPrice: 300, salePrice: 800,
      stock: 40, imageUrl: null, variants: null, lowStockThreshold: 10, createdAt: now,
    },
    {
      id: 'demo-p4', businessId, name: 'Torta personalizada', costPrice: 6000, salePrice: 15000,
      stock: null, imageUrl: null,
      variants: [
        { id: 'demo-v1', name: 'Chica (10 porciones)', salePrice: 12000, costPrice: 5000, stock: null },
        { id: 'demo-v2', name: 'Mediana (20 porciones)', salePrice: 18000, costPrice: 8000, stock: null },
        { id: 'demo-v3', name: 'Grande (35 porciones)', salePrice: 26000, costPrice: 12000, stock: 2 },
      ],
      lowStockThreshold: null, createdAt: now,
    },
    {
      id: 'demo-p5', businessId, name: 'Brownies (unidad)', costPrice: 250, salePrice: 700,
      stock: 3, imageUrl: null, variants: null, lowStockThreshold: 5, createdAt: now,
    },
  ]

  const orders: Order[] = [
    {
      id: 'demo-o1', businessId, customerId: customers[0].id, customerName: customers[0].name,
      items: [{ productId: products[0].id, name: products[0].name, quantity: 1, unitSalePrice: 9000, unitCostPrice: 4500 }],
      discount: 0, discountType: 'amount', status: 'completed', dueDate: null,
      date: daysAgo(2), note: '', paymentMethod: 'efectivo', paid: true, createdAt: now,
    },
    {
      id: 'demo-o2', businessId, customerId: customers[1].id, customerName: customers[1].name,
      items: [{ productId: products[3].id, variantId: 'demo-v2', name: `${products[3].name} — Mediana (20 porciones)`, quantity: 1, unitSalePrice: 18000, unitCostPrice: 8000 }],
      discount: 10, discountType: 'percent', status: 'ready', dueDate: daysFromNow(0),
      date: daysAgo(1), note: 'Retira a las 18hs', paymentMethod: 'transferencia', paid: true, createdAt: now,
    },
    {
      id: 'demo-o3', businessId, customerId: customers[2].id, customerName: customers[2].name,
      items: [
        { productId: products[1].id, name: products[1].name, quantity: 2, unitSalePrice: 5500, unitCostPrice: 2200 },
        { productId: products[2].id, name: products[2].name, quantity: 1, unitSalePrice: 800, unitCostPrice: 300 },
      ],
      discount: 0, discountType: 'amount', status: 'pending', dueDate: daysFromNow(3),
      date: today(), note: '', paymentMethod: 'mercadopago', paid: false, createdAt: now,
    },
    {
      id: 'demo-o4', businessId, customerId: customers[3].id, customerName: customers[3].name,
      items: [{ productId: products[4].id, name: products[4].name, quantity: 6, unitSalePrice: 700, unitCostPrice: 250 }],
      discount: 0, discountType: 'amount', status: 'completed', dueDate: null,
      date: daysAgo(9), note: '', paymentMethod: 'efectivo', paid: true, createdAt: now,
    },
  ]

  const expenses: Expense[] = [
    { id: 'demo-e1', businessId, amount: 18000, category: 'insumos', note: 'Harina, huevos y crema', date: daysAgo(3), createdAt: now },
    { id: 'demo-e2', businessId, amount: 6500, category: 'envios', note: 'Delivery pedidos grandes', date: daysAgo(5), createdAt: now },
    { id: 'demo-e3', businessId, amount: 12000, category: 'marketing', note: 'Publicidad Instagram', date: daysAgo(10), createdAt: now },
  ]

  const appointments: Appointment[] = [
    { id: 'demo-a1', businessId, title: 'Comprar insumos', description: 'Harina 000, manteca, chocolate', type: 'tarea', date: daysFromNow(1), createdAt: now },
    { id: 'demo-a2', businessId, title: 'Reunión con Julián', description: 'Definir diseño de la torta de cumpleaños', type: 'cita', date: daysFromNow(2), createdAt: now },
  ]

  const socialMetrics: SocialMetric[] = [
    { id: 'demo-s1', businessId, platform: 'instagram', weekStart: isoWeekStart(new Date(daysAgo(7))), reach: 1200, interactions: 180, newFollowers: 24, posts: 4, createdAt: now },
    { id: 'demo-s2', businessId, platform: 'instagram', weekStart: isoWeekStart(new Date()), reach: 1450, interactions: 210, newFollowers: 31, posts: 5, createdAt: now },
  ]

  return { user, business, products, customers, customerGroups, orders, expenses, appointments, socialMetrics }
}
