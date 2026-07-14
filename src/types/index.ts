export type Sex = 'F' | 'M' | 'Otro' | ''
export type DiscountType = 'amount' | 'percent'
export type PaymentMethod = 'efectivo' | 'mercadopago' | 'transferencia'
export type Platform = 'instagram' | 'tiktok' | 'facebook'
export type OrderStatus = 'pending' | 'ready' | 'completed'
export type AppointmentType = 'cita' | 'tarea' | 'recordatorio' | 'otro'
export type ExpenseCategory =
  | 'insumos'
  | 'servicios'
  | 'alquiler'
  | 'sueldos'
  | 'impuestos'
  | 'envios'
  | 'marketing'
  | 'otros'
export type Plan = 'free' | 'pro'

export interface Business {
  id: string
  name: string
  currency: string
  // Catálogo público: link brotaonline.com/tienda/<slug>; null = no activado
  slug?: string | null
  // WhatsApp del negocio para el botón "Pedir" del catálogo
  whatsapp?: string
  createdAt: string
}

// Variante de un producto (talla, color, presentación).
// Se guarda embebida en products.variants como JSONB; las claves quedan en
// camelCase porque toSnake/toCamel solo convierten el nivel superior.
export interface ProductVariant {
  id: string
  name: string // "M / Negro", "500g"
  salePrice: number | null // null = hereda el precio del producto
  costPrice: number | null
  stock: number | null // null = sin control de stock
}

export interface Product {
  id: string
  businessId: string
  name: string
  costPrice: number
  salePrice: number
  stock: number | null
  // Foto para el catálogo público (URL pública de Supabase Storage)
  imageUrl?: string | null
  // null/undefined = sin variantes
  variants?: ProductVariant[] | null
  // Alerta "por agotarse" cuando stock <= umbral; null = sin alerta
  lowStockThreshold?: number | null
  createdAt: string
}

export interface CustomerGroup {
  id: string
  businessId: string
  name: string
  color: string
  createdAt: string
}

export interface Customer {
  id: string
  businessId: string
  name: string
  phone: string
  age: number | null
  sex: Sex
  groupId: string | null
  notes: string
  createdAt: string
}

export interface OrderItem {
  productId: string
  // Si es una variante, el nombre ya viene compuesto: "Producto — Variante"
  name: string
  quantity: number
  unitSalePrice: number
  unitCostPrice: number
  variantId?: string | null
}

export interface Order {
  id: string
  businessId: string
  customerId: string | null
  customerName: string
  items: OrderItem[]
  discount: number
  discountType: DiscountType
  status: OrderStatus
  dueDate: string | null
  date: string
  note: string
  paymentMethod: PaymentMethod
  // false = fiado (pago pendiente); undefined en filas viejas = pagado
  paid?: boolean
  createdAt: string
}

export interface SocialMetric {
  id: string
  businessId: string
  platform: Platform
  weekStart: string
  reach: number
  interactions: number
  newFollowers: number
  posts: number
  createdAt: string
}

export interface Expense {
  id: string
  businessId: string
  amount: number
  category: ExpenseCategory
  note: string
  date: string
  createdAt: string
}

export interface Appointment {
  id: string
  businessId: string
  title: string
  description: string
  type: AppointmentType
  date: string
  createdAt: string
}

export interface AppUser {
  id: string
  email: string
  plan: Plan
  // Se registró durante la beta de lanzamiento → beneficio en Premium
  isFounder?: boolean
  businessId: string | null
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}
