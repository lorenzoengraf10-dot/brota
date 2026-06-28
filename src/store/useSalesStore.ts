import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Sale } from '@/types'

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
    const { data } = await supabase.from('sales').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    set({ sales: (data ?? []) as Sale[], loading: false })
  },
  add: async (s) => {
    const { data } = await supabase.from('sales').insert({ ...s, user_id: s.userId }).select().single()
    if (data) set((state) => ({ sales: [data as Sale, ...state.sales] }))
  },
  update: async (id, s) => {
    await supabase.from('sales').update(s).eq('id', id)
    set((state) => ({ sales: state.sales.map((x) => x.id === id ? { ...x, ...s } : x) }))
  },
  remove: async (id) => {
    await supabase.from('sales').delete().eq('id', id)
    set((state) => ({ sales: state.sales.filter((x) => x.id !== id) }))
  }
}))
