import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types'

interface ExpensesState {
  expenses: Expense[]
  loading: boolean
  fetch: (userId: string) => Promise<void>
  add: (e: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  update: (id: string, e: Partial<Expense>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useExpensesStore = create<ExpensesState>()((set) => ({
  expenses: [],
  loading: false,
  fetch: async (userId) => {
    set({ loading: true })
    const { data } = await supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false })
    set({ expenses: (data ?? []) as Expense[], loading: false })
  },
  add: async (e) => {
    const { data } = await supabase.from('expenses').insert({ ...e, user_id: e.userId }).select().single()
    if (data) set((s) => ({ expenses: [data as Expense, ...s.expenses] }))
  },
  update: async (id, e) => {
    await supabase.from('expenses').update(e).eq('id', id)
    set((s) => ({ expenses: s.expenses.map((x) => x.id === id ? { ...x, ...e } : x) }))
  },
  remove: async (id) => {
    await supabase.from('expenses').delete().eq('id', id)
    set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) }))
  }
}))
