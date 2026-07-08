import { lazy, Suspense, useEffect, useState } from 'react'
import { Sprout, Settings, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'
import BottomNav from './BottomNav'
import NotificationsSheet from './NotificationsSheet'
import { dueState } from '@/lib/delivery'
import FeedbackModal from '@/components/marketing/FeedbackModal'
import ProEntryModal from '@/components/marketing/ProEntryModal'
import InstallPrompt from '@/components/marketing/InstallPrompt'
import { today } from '@/lib/format'
import { trackEvent, trackPageView } from '@/lib/gaTracking'

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
const PRO_LAST_KEY = 'brota-pro-last-shown'
const PRO_SNOOZE_KEY = 'brota-pro-snoozed'
const DELIVERY_NOTIF_KEY = 'brota-delivery-notif'
const DAY = 86400000
// El modal Pro aparece cada 2 días; "No volver a mostrar" lo silencia 12 días
const PRO_EVERY_DAYS = 2
const PRO_SNOOZE_DAYS = 12

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
  const { currentView, setView, notifications, user, orders, addNotification } = useStore()
  const unread = notifications.filter((n) => !n.read).length
  const [showPro, setShowPro] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Recordatorio de entregas: una notificación por día al abrir la app
  useEffect(() => {
    if (orders.length === 0) return
    const todayKey = today()
    if (localStorage.getItem(DELIVERY_NOTIF_KEY) === todayKey) return

    const dueToday = orders.filter((o) => o.status !== 'completed' && dueState(o.dueDate) === 'today')
    const overdue = orders.filter((o) => o.status !== 'completed' && dueState(o.dueDate) === 'overdue')
    if (dueToday.length === 0 && overdue.length === 0) return

    localStorage.setItem(DELIVERY_NOTIF_KEY, todayKey)
    if (dueToday.length > 0) {
      addNotification({
        title: `Hoy entregás ${dueToday.length} pedido${dueToday.length !== 1 ? 's' : ''}`,
        message: dueToday.map((o) => o.customerName || 'Cliente ocasional').join(', '),
        type: 'warning',
      })
    }
    if (overdue.length > 0) {
      addNotification({
        title: `${overdue.length} entrega${overdue.length !== 1 ? 's' : ''} vencida${overdue.length !== 1 ? 's' : ''}`,
        message: overdue.map((o) => o.customerName || 'Cliente ocasional').join(', '),
        type: 'error',
      })
    }
  }, [orders])

  useEffect(() => {
    if (!user) return

    // Record first-use date
    const install = localStorage.getItem(INSTALL_KEY) ?? today()
    if (!localStorage.getItem(INSTALL_KEY)) localStorage.setItem(INSTALL_KEY, install)

    // Check if weekly feedback is due
    const lastFeedback = localStorage.getItem(FEEDBACK_KEY)
    const refDate = lastFeedback ?? install
    const days = Math.floor((Date.now() - new Date(refDate).getTime()) / DAY)
    const feedbackDue = days >= 7

    const lastPro = Number(localStorage.getItem(PRO_LAST_KEY) ?? 0)
    const snoozedAt = Number(localStorage.getItem(PRO_SNOOZE_KEY) ?? 0)
    const proSnoozed = Date.now() - snoozedAt < PRO_SNOOZE_DAYS * DAY
    const proDue = Date.now() - lastPro >= PRO_EVERY_DAYS * DAY

    const t = setTimeout(() => {
      if (feedbackDue) {
        setShowFeedback(true)
        trackEvent('feedback_prompt_shown')
      } else if (user.plan !== 'pro' && proDue && !proSnoozed) {
        setShowPro(true)
        localStorage.setItem(PRO_LAST_KEY, String(Date.now()))
        trackEvent('pro_entry_shown')
      }
    }, 1500)

    return () => clearTimeout(t)
  }, [user?.id])

  function handleProSnooze() {
    localStorage.setItem(PRO_SNOOZE_KEY, String(Date.now()))
    setShowPro(false)
  }

  useEffect(() => {
    trackPageView(currentView)
  }, [currentView])

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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <Bell size={20} className="text-ink-soft" strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setView('settings')}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <Settings size={20} className="text-ink-soft" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <Suspense fallback={<ViewLoader />}>
          <CurrentView view={currentView} />
        </Suspense>
      </main>

      <InstallPrompt />
      <BottomNav />

      <NotificationsSheet open={showNotifications} onClose={() => setShowNotifications(false)} />
      <FeedbackModal open={showFeedback} onClose={handleFeedbackClose} />
      <ProEntryModal open={showPro} onClose={() => setShowPro(false)} onSnooze={handleProSnooze} />
    </div>
  )
}
