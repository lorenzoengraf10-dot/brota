import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { initGA } from '@/lib/analytics'
import ErrorBoundary from '@/components/ErrorBoundary'
import CookieBanner from '@/components/CookieBanner'
import NotificationsBell from '@/components/NotificationsBell'
import Onboarding from '@/components/Onboarding'
import AuthPage from '@/components/AuthPage'
import Dashboard from '@/components/Dashboard'
import Sales from '@/components/Sales'
import Products from '@/components/Products'
import Clients from '@/components/Clients'
import Expenses from '@/components/Expenses'
import SocialMedia from '@/components/SocialMedia'
import Settings from '@/components/Settings'
import Landing from '@/components/Landing'
import PrivacyPolicy from '@/components/PrivacyPolicy'
import TermsAndConditions from '@/components/TermsAndConditions'
import BottomNav from '@/components/BottomNav'

export default function App() {
  const { user, loading, initialize } = useAuthStore()
  const { currentView, onboardingDone, cookieConsent, setView } = useAppStore()

  useEffect(() => { initialize() }, [])

  useEffect(() => {
    if (cookieConsent === true) initGA()
  }, [cookieConsent])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f6f2e8]">
        <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (currentView === 'landing') return <Landing onEnter={() => setView('dashboard')} />
  if (currentView === 'privacy') return <PrivacyPolicy onBack={() => setView('landing')} />
  if (currentView === 'terms') return <TermsAndConditions onBack={() => setView('landing')} />

  if (!user) return <AuthPage />

  if (!onboardingDone) return <Onboarding />

  const views: Record<string, JSX.Element> = {
    dashboard: <Dashboard />,
    sales: <Sales />,
    products: <Products />,
    clients: <Clients />,
    expenses: <Expenses />,
    social: <SocialMedia />,
    settings: <Settings />,
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full max-w-lg mx-auto">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e5e0d5] sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="14" fill="#059669"/>
              <path d="M32 12 C20 12 14 22 16 32 C18 42 26 50 32 52 C38 50 46 42 48 32 C50 22 44 12 32 12Z" fill="#f6f2e8" opacity="0.9"/>
              <path d="M32 28 L32 52 M24 36 C24 36 28 32 32 34 C36 36 40 32 40 32" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="font-semibold text-[#059669] text-lg">Brota</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <button
              onClick={() => setView('settings')}
              className={`p-2 rounded-full transition-colors ${
                currentView === 'settings'
                  ? 'text-[#059669] bg-[#f6f2e8]'
                  : 'text-gray-400 hover:bg-[#f6f2e8]'
              }`}
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {views[currentView] ?? <Dashboard />}
          </AnimatePresence>
        </main>

        <BottomNav />
        <CookieBanner />
      </div>
    </ErrorBoundary>
  )
}
