import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Client, ClientGroup } from '@/types'

interface ClientsState {
  clients: Client[]
  groups: ClientGroup[]
  loading: boolean
  fetch: (userId: string) => Promise<void>
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => Promise<void>
  updateClient: (id: string, c: Partial<Client>) => Promise<void>
  removeClient: (id: string) => Promise<void>
  addGroup: (g: Omit<ClientGroup, 'id' | 'createdAt'>) => Promise<void>
  removeGroup: (id: string) => Promise<void>
}

export const useClientsStore = create<ClientsState>()((set) => ({
  clients: [],
  groups: [],
  loading: false,
  fetch: async (userId) => {
    set({ loading: true })
    const [{ data: clients }, { data: groups }] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', userId).order('name'),
      supabase.from('client_groups').select('*').eq('user_id', userId).order('name')
    ])
    set({ clients: (clients ?? []) as Client[], groups: (groups ?? []) as ClientGroup[], loading: false })
  },
  addClient: async (c) => {
    const { data } = await supabase.from('clients').insert({ ...c, user_id: c.userId }).select().single()
    if (data) set((s) => ({ clients: [data as Client, ...s.clients] }))
  },
  updateClient: async (id, c) => {
    await supabase.from('clients').update(c).eq('id', id)
    set((s) => ({ clients: s.clients.map((x) => x.id === id ? { ...x, ...c } : x) }))
  },
  removeClient: async (id) => {
    await supabase.from('clients').delete().eq('id', id)
    set((s) => ({ clients: s.clients.filter((x) => x.id !== id) }))
  },
  addGroup: async (g) => {
    const { data } = await supabase.from('client_groups').insert({ ...g, user_id: g.userId }).select().single()
    if (data) set((s) => ({ groups: [data as ClientGroup, ...s.groups] }))
  },
  removeGroup: async (id) => {
    await supabase.from('client_groups').delete().eq('id', id)
    set((s) => ({ groups: s.groups.filter((x) => x.id !== id) }))
  }
}))
