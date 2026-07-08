import { useEffect, useState } from 'react'
import { X, Smartphone } from 'lucide-react'
import { trackEvent } from '@/lib/gaTracking'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'brota-install-dismissed'
const DISMISS_DAYS = 14

function recentlyDismissed(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY)
  if (!ts) return false
  return Date.now() - Number(ts) < DISMISS_DAYS * 86400000
}

// Banner "Instalá Brota": clave para retención — el ícono en la pantalla
// de inicio trae al usuario de vuelta sin depender de que recuerde la URL
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      if (recentlyDismissed()) return
      setDeferred(e as BeforeInstallPromptEvent)
      trackEvent('pwa_install_prompt_shown')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!deferred) return null

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    trackEvent('pwa_install_choice', { outcome })
    setDeferred(null)
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDeferred(null)
  }

  return (
    <div className="mx-4 mb-2 bg-brand-600 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
      <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <Smartphone size={18} color="white" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight">Instalá Brota en tu celu</p>
        <p className="text-white/75 text-xs">Acceso directo, sin abrir el navegador.</p>
      </div>
      <button
        onClick={install}
        className="bg-white text-brand-700 text-xs font-bold px-3 py-2 rounded-xl shrink-0"
      >
        Instalar
      </button>
      <button onClick={dismiss} className="p-1 shrink-0">
        <X size={16} className="text-white/70" />
      </button>
    </div>
  )
}
