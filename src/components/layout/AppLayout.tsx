import { lazy, Suspense, useEffect, useState } from 'react'
import { Sprout, Settings } from 'lucide-react'
import { useStore } from '@/store/useStore'
import BottomNav from './BottomNav'
import FeedbackModal from '@/components/marketing/FeedbackModal'
import ProEntryModal from '@/components/marketing/ProEntryModal'
import { today } from '@/lib/format'

const Dashboard = lazy(() => import('@/views/Dashboard'))
const Orders = lazy(() => import('@/views/Orders'))
const Products = lazy(() => import('@/views/Products'))
const Customers = lazy(() => import('@/views/Customers'))
const Groups = lazy(() => import('@/views/Groups'))
const Social = lazy(() => import('@/views/Social'))
const Expenses = lazy(() => import('@/views/Expenses'))
const Calendar = lazy(() => import('@/views/Calendar'))
const SettingsView = lazy(() => import('@/views/Settings'))

const INSTALL_KEY = 'brota-install'
const FEEDBACK_KEY = 'brota-feedback-asked'

function ViewLoader() {
  return (
    <div className="flex items-center justify-center flex-1 py-20">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function CurrentView({ view }: { view: string }) {
  switch (view) {
    case 'orders': return <Orders />
    case 'products': return <Products />
    case 'customers': return <Customers />
    case 'groups': return <Groups />
    case 'social': return <Social />
    case 'expenses': return <Expenses />
    case 'calendar': return <Calendar />
    case 'settings': return <SettingsView />
    default: return <Dashboard />
  }
}

export default function AppLayout() {
  const { currentView, setView, notifications, user } = useStore()
  const unread = notifications.filter((n) => !n.read).length
  const [showPro, setShowPro] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (!user) return

    // Record first-use date
    const install = localStorage.getItem(INSTALL_KEY) ?? today()
    if (!localStorage.getItem(INSTALL_KEY)) localStorage.setItem(INSTALL_KEY, install)

    // Check if weekly feedback is due
    const lastFeedback = localStorage.getItem(FEEDBACK_KEY)
    const refDate = lastFeedback ?? install
    const days = Math.floor((Date.now() - new Date(refDate).getTime()) / 86400000)
    const feedbackDue = days >= 7

    const t = setTimeout(() => {
      if (feedbackDue) {
        setShowFeedback(true)
      } else if (user.plan !== 'pro') {
        setShowPro(true)
      }
    }, 1500)

    return () => clearTimeout(t)
  }, [user?.id])

  function handleFeedbackClose() {
    localStorage.setItem(FEEDBACK_KEY, today())
    setShowFeedback(false)
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-cream">
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-black/5 sticky top-0 z-40">
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sprout size={14} color="white" strokeWidth={2.5} />
          </span>
          <span className="font-bold text-ink text-[17px] tracking-tight">Brota</span>
        </button>
        <button
          onClick={() => setView('settings')}
          className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <Settings size={20} className="text-ink-soft" strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600" />
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <Suspense fallback={<ViewLoader />}>
          <CurrentView view={currentView} />
        </Suspense>
      </main>

      <BottomNav />

      <FeedbackModal open={showFeedback} onClose={handleFeedbackClose} />
      <ProEntryModal open={showPro} onClose={() => setShowPro(false)} />
    </div>
  )
}
