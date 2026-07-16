import { Sprout, ShoppingBag, Users, CreditCard, BarChart2, Store, Zap, PlayCircle, ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { trackEvent } from '@/lib/gaTracking'

const FEATURES = [
  { icon: Zap, title: 'Venta rápida', desc: 'Cobrá en el mostrador en dos toques: elegís productos y listo.' },
  { icon: ShoppingBag, title: 'Pedidos & fiado', desc: 'Seguí el estado de cada pedido, quién te debe y cuándo entregás.' },
  { icon: Users, title: 'Clientes', desc: 'Guardá los datos de tus clientes, agrupalos y recordales por WhatsApp.' },
  { icon: CreditCard, title: 'Gastos y ganancia', desc: 'Controlá en qué gastás y mirá la ganancia real de tu negocio.' },
  { icon: Store, title: 'Catálogo online', desc: 'Un link para compartir en tu bio: tus clientes piden directo por WhatsApp.' },
  { icon: BarChart2, title: 'Redes sociales', desc: 'Seguí tus métricas de Instagram, TikTok y Facebook semana a semana.' },
]

const STEPS = [
  { n: '1', t: 'Cargá tus productos', d: 'y precios, en un minuto.' },
  { n: '2', t: 'Registrá tus ventas', d: 'desde el celu, mientras atendés.' },
  { n: '3', t: 'Mirá cómo crece', d: 'tu negocio con números claros.' },
]

export default function Landing() {
  const { setView, setLandingSeen, enterDemo } = useStore()

  function start() {
    trackEvent('landing_cta_click')
    setLandingSeen()
    setView('dashboard')
  }

  function demo() {
    trackEvent('landing_demo_click')
    enterDemo()
  }

  return (
    <div className="flex flex-col min-h-full bg-cream">
      {/* Hero */}
      <div className="flex flex-col items-center px-6 pt-16 pb-10 text-center">
        <div className="w-20 h-20 rounded-[22px] bg-brand-600 flex items-center justify-center mb-5 shadow-lg shadow-brand-600/25">
          <Sprout size={40} color="white" strokeWidth={2} />
        </div>
        <h1 className="text-[42px] leading-none font-black text-ink tracking-tight mb-3">Brota</h1>
        <p className="text-lg text-ink-soft max-w-xs leading-relaxed">
          La app para organizar tu emprendimiento: ventas, pedidos, clientes y gastos, todo desde el celu.
        </p>

        <div className="w-full max-w-xs mt-8 space-y-3">
          <button
            onClick={start}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 text-white text-base font-bold rounded-[20px] shadow-lg shadow-brand-600/25 hover:bg-brand-700 active:scale-[0.98] transition-all"
          >
            Empezar gratis <ArrowRight size={18} />
          </button>
          <button
            onClick={demo}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-surface text-brand-600 text-base font-bold rounded-[20px] border border-brand-600/20 active:scale-[0.98] transition-all"
          >
            <PlayCircle size={18} /> Ver demo sin registrarme
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-soft">Sin tarjeta · Sin instalación · Probá antes de crear tu cuenta</p>

        <div className="mt-6 bg-brand-600/10 rounded-2xl px-4 py-3 max-w-xs">
          <p className="text-xs text-ink leading-relaxed">
            <span className="font-bold text-brand-600">Gratis para siempre.</span>{' '}
            Durante la beta tenés todo desbloqueado. Más adelante habrá un plan
            Premium con extras opcionales — pero lo gratis se queda.
          </p>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="px-5 pb-10 max-w-lg mx-auto w-full">
        <h2 className="text-center text-xs font-semibold text-ink-soft uppercase tracking-widest mb-4">Cómo funciona</h2>
        <div className="grid grid-cols-3 gap-2">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-surface rounded-[20px] p-3 border border-black/[0.03] text-center">
              <div className="w-8 h-8 mx-auto rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mb-2">{s.n}</div>
              <p className="text-[13px] font-semibold text-ink leading-tight">{s.t}</p>
              <p className="text-[11px] text-ink-soft mt-0.5 leading-tight">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-5 pb-12 space-y-3 max-w-lg mx-auto w-full">
        <h2 className="text-center text-xs font-semibold text-ink-soft uppercase tracking-widest mb-1">Todo lo que necesitás</h2>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-4 bg-surface rounded-[20px] p-4 border border-black/[0.03]">
            <div className="w-11 h-11 rounded-[14px] bg-brand-50 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">{title}</p>
              <p className="text-ink-soft text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA final */}
      <div className="px-6 pb-8 max-w-lg mx-auto w-full">
        <button
          onClick={start}
          className="w-full px-8 py-4 bg-brand-600 text-white text-base font-bold rounded-[20px] shadow-lg shadow-brand-600/25 hover:bg-brand-700 active:scale-[0.98] transition-all"
        >
          Empezar gratis 🌱
        </button>
        <button onClick={demo} className="w-full mt-2 py-2.5 text-sm text-brand-600 font-semibold">
          o probá la demo primero
        </button>
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
