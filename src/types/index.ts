export interface User {
  id: string
  email: string
  businessName?: string
  plan: 'free' | 'pro'
  createdAt: string
}

export interface Product {
  id: string
  userId: string
  name: string
  description?: string
  price: number
  cost?: number
  stock?: number
  category?: string
  imageUrl?: string
  active: boolean
  createdAt: string
}

export interface Client {
  id: string
  userId: string
  name: string
  phone?: string
  email?: string
  address?: string
  groupId?: string
  notes?: string
  createdAt: string
}

export interface ClientGroup {
  id: string
  userId: string
  name: string
  color?: string
  createdAt: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  userId: string
  clientId?: string
  clientName?: string
  items: SaleItem[]
  total: number
  paymentMethod: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'otro'
  status: 'pendiente' | 'pagado' | 'cancelado'
  notes?: string
  createdAt: string
}

export interface Expense {
  id: string
  userId: string
  description: string
  amount: number
  category: string
  date: string
  notes?: string
  createdAt: string
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'whatsapp' | 'website' | 'otro'
  url: string
  handle?: string
}

export interface BusinessProfile {
  userId: string
  businessName: string
  description?: string
  phone?: string
  address?: string
  logoUrl?: string
  socialLinks: SocialLink[]
  updatedAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export interface DashboardStats {
  totalSalesToday: number
  totalSalesWeek: number
  totalSalesMonth: number
  totalExpensesMonth: number
  netProfitMonth: number
  totalClients: number
  totalProducts: number
  recentSales: Sale[]
}
