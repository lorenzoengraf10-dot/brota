import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { WA_NUMBER } from '@/lib/plan'
import { trackEvent } from '@/lib/gaTracking'

interface Props {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: Props) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  if (!open) return null

  function handleSend() {
    const starsText = '⭐'.repeat(stars)
    const msg = `🌱 Feedback de Brota\n${starsText}\n\n${comment.trim() || '(sin comentario)'}`
    trackEvent('feedback_sent', { stars })
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50">
      <div className="bg-surface w-full max-w-lg mx-auto rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-ink">¿Cómo va Brota? 🌱</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X size={20} className="text-ink-soft" />
          </button>
        </div>
        <p className="text-ink-soft text-sm mb-5">
          Tu opinión nos ayuda a mejorar. Contános qué te gusta y qué cambiarías.
        </p>

        <div className="flex justify-center gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(s)}
              className="p-1 active:scale-110 transition-transform"
            >
              <Star
                size={38}
                strokeWidth={1.5}
                className={`transition-colors ${
                  s <= (hovered || stars)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="¿Qué te gusta? ¿Qué cambiarías? (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft resize-none mb-4"
        />

        <button
          onClick={handleSend}
          disabled={stars === 0}
          className="w-full bg-brand-600 text-white font-semibold py-3 rounded-2xl text-sm mb-2 disabled:opacity-40 transition-opacity"
        >
          Enviar feedback
        </button>
        <button
          onClick={onClose}
          className="w-full text-sm text-ink-soft py-2 font-medium"
        >
          Saltar por ahora
        </button>
      </div>
    </div>
  )
}
