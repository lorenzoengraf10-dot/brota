import { X, Check } from 'lucide-react'
import { PRO_PRICE, PRO_FEATURES, waProLink } from '@/lib/plan'
import { useStore } from '@/store/useStore'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ProEntryModal({ open, onClose }: Props) {
  const { user } = useStore()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="bg-surface w-full max-w-lg mx-auto rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Plan Pro</span>
            <h2 className="text-xl font-bold text-ink mt-0.5">¿Te sumás al Pro?</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X size={20} className="text-ink-soft" />
          </button>
        </div>

        <div className="text-3xl font-bold text-ink mb-1">{PRO_PRICE}</div>
        <p className="text-ink-soft text-sm mb-5">Sin contrato, cancelás cuando querés.</p>

        <ul className="space-y-2.5 mb-6">
          {PRO_FEATURES.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check size={16} className="text-brand-600 mt-0.5 shrink-0" strokeWidth={2.5} />
              <span className="text-sm text-ink">{f}</span>
            </li>
          ))}
        </ul>

        <a
          href={waProLink(user?.email)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white font-semibold rounded-2xl text-sm mb-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.526 5.845L0 24l6.335-1.507A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.374l-.36-.214-3.727.977.995-3.638-.235-.374A9.818 9.818 0 112 12c0-5.427 4.391-9.818 9.818-9.818H12c5.427 0 9.818 4.391 9.818 9.818S17.427 21.818 12 21.818z" />
          </svg>
          Contratar por WhatsApp
        </a>
        <button
          onClick={onClose}
          className="w-full text-sm text-ink-soft py-2 font-medium"
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}
