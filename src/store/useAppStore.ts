import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types'

type View =
  | 'dashboard'
  | 'sales'
  | 'products'
  | 'clients'
  | 'expenses'
  | 'social'
  | 'settings'
  | 'landing'
  | 'privacy'
  | 'terms'

interface AppState {
  currentView: View
  onboardingDone: boolean
  cookieConsent: boolean | null
  notifications: Notification[]
  setView: (view: View) => void
  completeOnboarding: () => void
  setCookieConsent: (v: boolean) => void
  resetCookieConsent: () => void
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      onboardingDone: false,
      cookieConsent: null,
      notifications: [],
      setView: (view) => set({ currentView: view }),
      completeOnboarding: () => set({ onboardingDone: true }),
      setCookieConsent: (v) => set({ cookieConsent: v }),
      resetCookieConsent: () => set({ cookieConsent: null }),
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: crypto.randomUUID(), read: false, createdAt: new Date().toISOString() },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'brota-app',
      partialize: (s) => ({
        onboardingDone: s.onboardingDone,
        cookieConsent: s.cookieConsent,
        currentView: s.currentView,
      }),
    }
  )
)
