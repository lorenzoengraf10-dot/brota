import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

const steps = [
  {
    icon: <TrendingUp size={40} className="text-[#059669]" />,
    title: '¡Bienvenido/a a Brota!',
    desc: 'Tu herramienta de gestión simple para emprendedores argentinos. Registrá ventas, gastos y mucho más.'
  },
  {
    icon: <ShoppingBag size={40} className="text-[#059669]" />,
    title: 'Tus ventas en un lugar',
    desc: 'Registrá cada venta con productos, clientes y método de pago. Mirá tus ganancias en tiempo real.'
  },
  {
    icon: <Users size={40} className="text-[#059669]" />,
    title: 'Gestioná tus clientes',
    desc: 'Guardá contactos, agrupalos y llevá un registro de quiénes te compran más seguido.'
  },
  {
    icon: <CheckCircle size={40} className="text-[#059669]" />,
    title: '¡Listo para empezar!',
    desc: 'Ya podés empezar a usar Brota. Podés cambiar el nombre de tu negocio en Configuración.'
  }
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const { completeOnboarding } = useAppStore()
  const { user } = useAuthStore()
  const isLast = step === steps.length - 1

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-[#f6f2e8] px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm text-center"
        >
          <div className="flex justify-center mb-6">{steps[step].icon}</div>
          <h2 className="text-2xl font-bold mb-3">{steps[step].title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{steps[step].desc}</p>
          {step === 0 && user?.businessName && (
            <p className="mt-4 text-[#059669] font-semibold">{user.businessName}</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-10 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-[#059669]' : 'w-2 bg-gray-300'}`} />
        ))}
      </div>

      <button
        onClick={() => isLast ? completeOnboarding() : setStep(step + 1)}
        className="w-full max-w-sm py-3 bg-[#059669] text-white font-semibold rounded-xl"
      >
        {isLast ? 'Comenzar' : 'Siguiente'}
      </button>
    </div>
  )
}
