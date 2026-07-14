import { X, Sprout } from 'lucide-react'
import { FOUNDER_MESSAGE, waShareLink } from '@/lib/plan'
import { trackEvent } from '@/lib/gaTracking'

interface Props {
  open: boolean
  onClose: () => void
}

// Bienvenida de la beta: reemplaza al ProEntryModal mientras LAUNCH_FREE.
// Se muestra una sola vez por dispositivo (ver AppLayout).
export default function FounderModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
      <div className="bg-surface w-full max-w-lg sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl p-6 pb-10 sm:pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Beta de lanzamiento</span>
            <h2 className="text-xl font-bold text-ink mt-0.5">Sos fundador 🌱</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X size={20} className="text-ink-soft" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
            <Sprout size={18} className="text-brand-600" />
          </span>
          <p className="text-sm text-ink leading-relaxed">{FOUNDER_MESSAGE}</p>
        </div>

        <a
          href={waShareLink()}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent('founder_share_click')}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 text-white font-semibold rounded-2xl text-sm mb-2"
        >
          Recomendar Brota a un amigo
        </a>
        <button onClick={onClose} className="w-full text-sm text-ink-soft py-2 font-medium">
          Entendido
        </button>
      </div>
    </div>
  )
}
