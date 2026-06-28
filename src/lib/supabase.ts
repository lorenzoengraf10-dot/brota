import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase. Ver .env.example')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: { Row: import('@/types').Product; Insert: Omit<import('@/types').Product, 'id' | 'createdAt'>; Update: Partial<import('@/types').Product> }
      clients: { Row: import('@/types').Client; Insert: Omit<import('@/types').Client, 'id' | 'createdAt'>; Update: Partial<import('@/types').Client> }
      client_groups: { Row: import('@/types').ClientGroup; Insert: Omit<import('@/types').ClientGroup, 'id' | 'createdAt'>; Update: Partial<import('@/types').ClientGroup> }
      sales: { Row: import('@/types').Sale; Insert: Omit<import('@/types').Sale, 'id' | 'createdAt'>; Update: Partial<import('@/types').Sale> }
      expenses: { Row: import('@/types').Expense; Insert: Omit<import('@/types').Expense, 'id' | 'createdAt'>; Update: Partial<import('@/types').Expense> }
      business_profiles: { Row: import('@/types').BusinessProfile; Insert: import('@/types').BusinessProfile; Update: Partial<import('@/types').BusinessProfile> }
    }
  }
}
