import { Sprout, ShoppingBag, Users, CreditCard, BarChart2, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'

const FEATURES = [
  { icon: ShoppingBag, title: 'Ventas & Pedidos', desc: 'Registrá cada venta, seguí el estado de tus pedidos y avisá por WhatsApp.' },
  { icon: Users, title: 'Clientes', desc: 'Guardá los datos de tus clientes y agrupaálos como querés.' },
  { icon: CreditCard, title: 'Gastos', desc: 'Controlá en qué gastás y calculá la ganancia real de tu negocio.' },
  { icon: BarChart2, title: 'Redes Sociales', desc: 'Seguimí tus métricas de Instagram, TikTok y Facebook semana a semana.' },
  { icon: Shield, title: 'Tus datos, seguros', desc: 'Sincronización en la nube con Supabase. Accedé desde cualquier dispositivo.' },
]

export default function Landing() {
  const { setView } = useStore()

  return (
    <div className="flex flex-col min-h-full bg-cream">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center mb-5 shadow-lg">
          <Sprout size={40} color="white" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-black text-ink tracking-tight mb-3">
          Brota
        </h1>
        <p className="text-lg text-ink-soft max-w-xs leading-relaxed">
          La app de gestión para emprendedores argentinos que venden por Instagram, TikTok y WhatsApp.
        </p>
        <button
          onClick={() => setView('dashboard')}
          className="mt-8 px-8 py-4 bg-brand-600 text-white text-base font-bold rounded-2xl shadow-lg hover:bg-brand-700 transition-colors"
        >
          Empezar gratis
        </button>
        <p className="mt-3 text-xs text-ink-soft">Sin tarjeta. Sin instalación.</p>
      </div>

      {/* Features */}
      <div className="px-5 pb-12 space-y-3 max-w-lg mx-auto w-full">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-4 bg-surface rounded-2xl p-4 border border-black/5"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">{title}</p>
              <p className="text-ink-soft text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pb-10 px-6">
        <p className="text-xs text-ink-soft">
          <button onClick={() => setView('privacy')} className="underline">Privacidad</button>
          {' · '}
          <button onClick={() => setView('terms')} className="underline">Términos</button>
        </p>
      </div>
    </div>
  )
}
