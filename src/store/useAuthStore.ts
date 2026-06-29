import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, businessName: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  refreshPlan: () => Promise<void>
}

async function getPlan(userId: string): Promise<'free' | 'pro'> {
  const { data } = await supabase
    .from('user_plans')
    .select('plan')
    .eq('user_id', userId)
    .single()
  return (data?.plan as 'free' | 'pro') ?? 'free'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },

      signUp: async (email, password, businessName) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { business_name: businessName } },
        })
        if (error) throw error
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },

      refreshPlan: async () => {
        const { user } = get()
        if (!user) return
        const plan = await getPlan(user.id)
        set((s) => (s.user ? { user: { ...s.user, plan } } : {}))
      },

      initialize: async () => {
        set({ loading: true })
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const plan = await getPlan(session.user.id)
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              businessName: session.user.user_metadata?.business_name,
              plan,
              createdAt: session.user.created_at,
            },
          })
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const plan = await getPlan(session.user.id)
            set({
              user: {
                id: session.user.id,
                email: session.user.email!,
                businessName: session.user.user_metadata?.business_name,
                plan,
                createdAt: session.user.created_at,
              },
            })
          } else {
            set({ user: null })
          }
        })
        set({ loading: false })
      },
    }),
    { name: 'brota-auth', partialize: (s) => ({ user: s.user }) }
  )
)
