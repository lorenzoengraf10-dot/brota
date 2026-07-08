import { useEffect, lazy, Suspense } from 'react'
import { useStore } from '@/store/useStore'
import { initGA } from '@/lib/gaTracking'
import CookieBanner from '@/components/marketing/CookieBanner'

const Landing = lazy(() => import('@/components/marketing/Landing'))
const PublicCatalog = lazy(() => import('@/views/PublicCatalog'))
const AuthScreen = lazy(() => import('@/components/auth/AuthScreen'))
const Onboarding = lazy(() => import('@/components/onboarding/Onboarding'))
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))
const PrivacyModal = lazy(() => import('@/components/legal/PrivacyModal'))
const TermsModal = lazy(() => import('@/components/legal/TermsModal'))

function Spinner() {
  return (
    <div className="flex items-center justify-center h-full bg-cream">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Catálogo público: no requiere sesión ni inicializa el store
const catalogSlug = window.location.pathname.startsWith('/tienda/')
  ? decodeURIComponent(window.location.pathname.slice('/tienda/'.length)).replace(/\/+$/, '')
  : null

export default function App() {
  const { user, loadingAuth, onboardingDone, currentView, landingSeen, cookieConsent, initialize } =
    useStore()

  useEffect(() => {
    if (!catalogSlug) initialize()

    const goOnline = () => useStore.getState().setOnline(true)
    const goOffline = () => useStore.getState().setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (cookieConsent === true) initGA()
  }, [cookieConsent])

  function content() {
    if (catalogSlug) return <PublicCatalog slug={catalogSlug} />

    if (loadingAuth) return <Spinner />

    if (currentView === 'privacy') return <PrivacyModal />
    if (currentView === 'terms') return <TermsModal />

    if (!user) {
      // Un visitante nuevo ve la landing; después de "Empezar gratis", el login
      if (!landingSeen || currentView === 'landing') return <Landing />
      return <AuthScreen />
    }

    if (!onboardingDone) return <Onboarding />

    return <AppLayout />
  }

  return (
    <>
      <Suspense fallback={<Spinner />}>{content()}</Suspense>
      {!catalogSlug && <CookieBanner />}
    </>
  )
}
