import { motion } from 'framer-motion'
import { TrendingUp, ShoppingCart, Users, CreditCard, Share2, Shield } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface Props { onEnter: () => void }

const features = [
  { icon: ShoppingCart, title: 'Ventas rápidas', desc: 'Registrá cada venta en segundos con productos y clientes.' },
  { icon: TrendingUp, title: 'Dashboard en tiempo real', desc: 'Mirá tus ganancias, gastos y métricas del mes al instante.' },
  { icon: Users, title: 'Gestión de clientes', desc: 'Guardá tus clientes, agrupalos y hacé seguimiento.' },
  { icon: CreditCard, title: 'Control de gastos', desc: 'Registrá todos tus gastos por categoría y fecha.' },
  { icon: Share2, title: 'Redes sociales', desc: 'Centralizá los links de tu negocio en un solo lugar.' },
  { icon: Shield, title: 'Tus datos seguros', desc: 'Acceso exclusivo con tu cuenta. Cumplimos Ley 25.326.' },
]

export default function Landing({ onEnter }: Props) {
  const { setView } = useAppStore()

  return (
    <div className="min-h-full bg-[#f6f2e8] flex flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#059669] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
              <path d="M32 10 C18 10 12 22 14 34 C16 46 26 54 32 56 C38 54 48 46 50 34 C52 22 46 10 32 10Z" fill="#f6f2e8" opacity="0.9"/>
              <path d="M32 26 L32 54 M22 36 C22 36 27 31 32 33 C37 35 42 31 42 31" stroke="#059669" strokeWidth="3" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="font-bold text-[#059669] text-lg">Brota</span>
        </div>
        <button onClick={onEnter} className="text-sm text-[#059669] font-medium">Ingresar</button>
      </header>

      <main className="flex-1 px-5 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center py-10">
          <h1 className="text-3xl font-bold text-gray-800 leading-tight">Gestioná tu emprendimiento<br /><span className="text-[#059669]">desde el celular</span></h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">Brota es la app de gestión diseñada para emprendedores argentinos. Simple, rápida y pensada para vos.</p>
          <button onClick={onEnter} className="mt-6 px-8 py-3 bg-[#059669] text-white font-semibold rounded-2xl text-sm shadow-lg shadow-[#059669]/20">
            Empezar gratis
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-[#e5e0d5] flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#059669]" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="px-5 py-4 border-t border-[#e5e0d5] flex justify-between text-xs text-gray-400">
        <span>© 2026 Brota</span>
        <div className="flex gap-4">
          <button onClick={() => setView('privacy')} className="hover:text-[#059669]">Privacidad</button>
          <button onClick={() => setView('terms')} className="hover:text-[#059669]">Términos</button>
        </div>
      </footer>
    </div>
  )
}
