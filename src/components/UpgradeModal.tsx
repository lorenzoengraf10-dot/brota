import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, MessageCircle } from 'lucide-react'
import { waProLink, PRO_PRICE } from '@/lib/plans'

interface Props { open: boolean; onClose: () => void }

const proFeatures = [
  'Productos, clientes y ventas ilimitados',
  'Exportación de datos a Excel (CSV)',
  'Reportes avanzados y comparativas',
  'Múltiples sucursales (próximamente)',
  'Soporte prioritario por WhatsApp',
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
                <span className="text-2xl">🌱</span>
                <h3 className="font-bold text-lg">Plan Pro</h3>
              </div>
              <button onClick={onClose}><X size={20} /></button>
            </div>

            <div className="bg-gradient-to-br from-[#059669] to-emerald-400 rounded-2xl p-4 mb-5 text-white">
              <p className="text-sm opacity-80 mb-1">Precio mensual</p>
              <p className="text-3xl font-bold">
                {PRO_PRICE}
                <span className="text-base font-normal opacity-70">/mes</span>
              </p>
              <p className="text-xs opacity-70 mt-1">
                Activación por WhatsApp · Sin tarjetas · Cancelá cuando quieras
              </p>
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

            <a
              href={waProLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full py-3.5 bg-[#25D366] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Activar por WhatsApp
            </a>
            <button onClick={onClose} className="w-full py-2.5 text-gray-400 text-sm mt-1">
              Más tarde
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
