import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const proFeatures = [
  'Ventas, productos y clientes ilimitados',
  'Exportar datos a Excel / PDF',
  'Reportes avanzados y comparativas',
  'Múltiples sucursales',
  'Soporte prioritario',
]

export default function UpgradeModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full rounded-t-3xl p-6 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-[#059669]" />
                <h3 className="font-bold text-lg">Actualizar a Pro</h3>
              </div>
              <button onClick={onClose}><X size={20} /></button>
            </div>

            <div className="bg-[#f6f2e8] rounded-2xl p-4 mb-5">
              <p className="text-2xl font-bold text-[#059669]">$X<span className="text-sm font-normal text-gray-500">/mes</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Cancelá cuando quieras</p>
            </div>

            <ul className="space-y-3 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-[#059669]" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button className="w-full py-3 bg-[#059669] text-white font-semibold rounded-xl text-sm">
              Suscribirme al plan Pro
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm mt-2">
              No por ahora
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
