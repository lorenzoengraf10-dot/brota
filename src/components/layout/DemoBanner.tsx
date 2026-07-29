import { Info } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function DemoBanner() {
  const { demoMode, exitDemo } = useStore()

  if (!demoMode) return null

  return (
    <div className="flex items-center gap-2 bg-amber-600 text-white text-xs px-4 py-2">
      <Info size={13} className="shrink-0" />
      <span className="flex-1">
        Estás en la demo: tu información no se va a guardar. Para guardarla, registrate o iniciá sesión.
      </span>
      <button
        onClick={exitDemo}
        className="bg-white/20 px-2 py-1 rounded-full font-semibold shrink-0 hover:bg-white/30 transition-colors"
      >
        Registrarme
      </button>
    </div>
  )
}
