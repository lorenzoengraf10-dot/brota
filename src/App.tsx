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
import Calendar from '@/components/Calendar'
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
    calendar: <Calendar />,
    settings: <Settings />,
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full max-w-lg mx-auto">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e5e0d5] sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="22" fill="#059669"/>
              <rect x="29" y="72" width="42" height="8" rx="4" fill="white"/>
              <path d="M50 70 C50 58 44 52 40 42" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none"/>
              <ellipse cx="32" cy="46" rx="22" ry="13" transform="rotate(-35 32 46)" fill="white"/>
              <ellipse cx="32" cy="46" rx="13" ry="6.5" transform="rotate(-35 32 46)" fill="#059669"/>
              <ellipse cx="63" cy="32" rx="17" ry="10" transform="rotate(30 63 32)" fill="white"/>
              <ellipse cx="63" cy="32" rx="9.5" ry="5" transform="rotate(30 63 32)" fill="#059669"/>
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
