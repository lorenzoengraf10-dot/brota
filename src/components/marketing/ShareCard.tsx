import { Gift } from 'lucide-react'
import { waShareLink } from '@/lib/plan'
import { trackEvent } from '@/lib/gaTracking'

// Recomendación boca a boca: el canal de adquisición más barato
// para el público de Brota (emprendedores que se conocen entre sí)
export default function ShareCard() {
  return (
    <a
      href={waShareLink()}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent('share_click', { channel: 'whatsapp' })}
      className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-emerald-500 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
    >
      <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <Gift size={20} color="white" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">¿Conocés a otro emprendedor?</p>
        <p className="text-white/80 text-xs">Recomendale Brota por WhatsApp. Es gratis 🌱</p>
      </div>
    </a>
  )
}
