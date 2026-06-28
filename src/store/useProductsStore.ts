import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

interface ProductsState {
  products: Product[]
  loading: boolean
  fetch: (userId: string) => Promise<void>
  add: (p: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  update: (id: string, p: Partial<Product>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useProductsStore = create<ProductsState>()((set) => ({
  products: [],
  loading: false,
  fetch: async (userId) => {
    set({ loading: true })
    const { data } = await supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    set({ products: (data ?? []) as Product[], loading: false })
  },
  add: async (p) => {
    const { data } = await supabase.from('products').insert({ ...p, user_id: p.userId }).select().single()
    if (data) set((s) => ({ products: [data as Product, ...s.products] }))
  },
  update: async (id, p) => {
    await supabase.from('products').update(p).eq('id', id)
    set((s) => ({ products: s.products.map((x) => x.id === id ? { ...x, ...p } : x) }))
  },
  remove: async (id) => {
    await supabase.from('products').delete().eq('id', id)
    set((s) => ({ products: s.products.filter((x) => x.id !== id) }))
  }
}))
