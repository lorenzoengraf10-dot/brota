import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

export default function CookieBanner() {
  const { cookieConsent, setCookieConsent, setView } = useAppStore()

  if (cookieConsent !== null) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-[72px] left-0 right-0 z-50 px-4 max-w-lg mx-auto"
      >
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-[#e5e0d5]">
          <p className="text-xs text-gray-600 mb-3">
            Usamos Google Analytics para mejorar la app. No compartimos tu información personal.
            Ver nuestra{' '}
            <button onClick={() => setView('privacy')} className="text-[#059669] underline">Política de Privacidad</button>.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCookieConsent(false)}
              className="flex-1 py-2 rounded-xl border border-[#e5e0d5] text-xs text-gray-600"
            >
              Rechazar
            </button>
            <button
              onClick={() => setCookieConsent(true)}
              className="flex-1 py-2 rounded-xl bg-[#059669] text-white text-xs font-semibold"
            >
              Aceptar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
