import { useEffect, lazy, Suspense } from 'react'
import { useStore } from '@/store/useStore'
import { initGA } from '@/lib/gaTracking'

const Landing = lazy(() => import('@/components/marketing/Landing'))
const AuthScreen = lazy(() => import('@/components/auth/AuthScreen'))
const Onboarding = lazy(() => import('@/components/onboarding/Onboarding'))
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))

function Spinner() {
  return (
    <div className="flex items-center justify-center h-full bg-cream">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { user, loadingAuth, onboardingDone, currentView, cookieConsent, initialize } =
    useStore()

  useEffect(() => { initialize() }, [])

  useEffect(() => {
    if (cookieConsent === true) initGA()
  }, [cookieConsent])

  if (loadingAuth) return <Spinner />

  if (currentView === 'landing')
    return <Suspense fallback={<Spinner />}><Landing /></Suspense>

  if (!user)
    return <Suspense fallback={<Spinner />}><AuthScreen /></Suspense>

  if (!onboardingDone)
    return <Suspense fallback={<Spinner />}><Onboarding /></Suspense>

  return <Suspense fallback={<Spinner />}><AppLayout /></Suspense>
}
