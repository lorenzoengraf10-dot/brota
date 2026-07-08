import { Cookie } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function CookieBanner() {
  const { cookieConsent, setCookieConsent, setView } = useStore()
  if (cookieConsent !== null) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3">
      <div className="max-w-lg mx-auto bg-surface rounded-2xl shadow-xl border border-black/10 p-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
            <Cookie size={18} className="text-brand-600" />
          </span>
          <p className="text-xs text-ink-soft leading-relaxed">
            Usamos cookies de Google Analytics para entender cómo se usa la app y mejorarla.
            Podés ver más en la{' '}
            <button onClick={() => setView('privacy')} className="underline text-ink">
              Política de Privacidad
            </button>.
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setCookieConsent(true)}
            className="flex-1 bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-xl"
          >
            Aceptar
          </button>
          <button
            onClick={() => setCookieConsent(false)}
            className="flex-1 bg-black/5 dark:bg-white/10 text-ink text-sm font-medium py-2.5 rounded-xl"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}
