import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Sale, SaleItem } from '@/types'

function mapSale(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    clientId: row.client_id as string | undefined,
    clientName: row.client_name as string | undefined,
    items: (row.items ?? []) as SaleItem[],
    subtotal: row.subtotal as number | undefined,
    discount: row.discount as number | undefined,
    discountType: row.discount_type as Sale['discountType'],
    discountAmount: row.discount_amount as number | undefined,
    total: row.total as number,
    paymentMethod: (row.payment_method ?? 'efectivo') as Sale['paymentMethod'],
    status: (row.status ?? 'pagado') as Sale['status'],
    orderStatus: row.order_status as Sale['orderStatus'],
    deliveryDate: row.delivery_date as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

function toDbInsert(s: Omit<Sale, 'id' | 'createdAt'>) {
  return {
    user_id: s.userId,
    client_id: s.clientId ?? null,
    client_name: s.clientName ?? null,
    items: s.items,
    subtotal: s.subtotal ?? null,
    discount: s.discount ?? null,
    discount_type: s.discountType ?? null,
    discount_amount: s.discountAmount ?? null,
    total: s.total,
    payment_method: s.paymentMethod,
    status: s.status,
    order_status: s.orderStatus ?? null,
    delivery_date: s.deliveryDate ?? null,
    notes: s.notes ?? null,
  }
}

function toDbUpdate(s: Partial<Sale>) {
  const mapped: Record<string, unknown> = {}
  if ('clientId' in s) mapped.client_id = s.clientId ?? null
  if ('clientName' in s) mapped.client_name = s.clientName ?? null
  if ('items' in s) mapped.items = s.items
  if ('subtotal' in s) mapped.subtotal = s.subtotal ?? null
  if ('discount' in s) mapped.discount = s.discount ?? null
  if ('discountType' in s) mapped.discount_type = s.discountType ?? null
  if ('discountAmount' in s) mapped.discount_amount = s.discountAmount ?? null
  if ('total' in s) mapped.total = s.total
  if ('paymentMethod' in s) mapped.payment_method = s.paymentMethod
  if ('status' in s) mapped.status = s.status
  if ('orderStatus' in s) mapped.order_status = s.orderStatus ?? null
  if ('deliveryDate' in s) mapped.delivery_date = s.deliveryDate ?? null
  if ('notes' in s) mapped.notes = s.notes ?? null
  return mapped
}

interface SalesState {
  sales: Sale[]
  loading: boolean
  fetch: (userId: string) => Promise<void>
  add: (s: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>
  update: (id: string, s: Partial<Sale>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSalesStore = create<SalesState>()((set) => ({
  sales: [],
  loading: false,
  fetch: async (userId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    set({ sales: (data ?? []).map((r) => mapSale(r as Record<string, unknown>)), loading: false })
  },
  add: async (s) => {
    const { data } = await supabase.from('sales').insert(toDbInsert(s)).select().single()
    if (data) set((state) => ({ sales: [mapSale(data as Record<string, unknown>), ...state.sales] }))
  },
  update: async (id, s) => {
    await supabase.from('sales').update(toDbUpdate(s)).eq('id', id)
    set((state) => ({ sales: state.sales.map((x) => x.id === id ? { ...x, ...s } : x) }))
  },
  remove: async (id) => {
    await supabase.from('sales').delete().eq('id', id)
    set((state) => ({ sales: state.sales.filter((x) => x.id !== id) }))
  },
}))
