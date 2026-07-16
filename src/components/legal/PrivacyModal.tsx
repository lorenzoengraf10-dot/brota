import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function PrivacyModal() {
  const { setView } = useStore()
  return (
    <div className="flex flex-col h-full bg-cream">
      <header className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-black/5 sticky top-0">
        <button onClick={() => setView('landing')} className="p-2 -ml-2 rounded-full hover:bg-black/5">
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="font-bold text-ink">Política de Privacidad</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-6 prose prose-sm max-w-none text-ink">
        <p className="text-xs text-ink-soft">Actualizado: julio 2026 · Ley 25.326 (Argentina)</p>
        <h3>1. Datos que recopilamos</h3>
        <p>Recopilamos el email que ingresás al registrarte y los datos que vos mismo cargás (ventas, clientes, gastos). No compartimos tu información con terceros.</p>
        <h3>2. Cómo usamos tus datos</h3>
        <p>Tus datos se almacenan en Supabase (infraestructura en la nube) y se usan exclusivamente para mostrarte tu propia información dentro de la app.</p>
        <h3>3. Cookies</h3>
        <p>Usamos Google Analytics 4 para entender el uso general de la app (número de visitas, funciones usadas). Podés rechazar esta opción.</p>
        <h3>4. Tus derechos</h3>
        <p>Podés solicitar la eliminación de tu cuenta y todos tus datos contactándonos por WhatsApp.</p>
        <h3>5. Contacto</h3>
        <p>Brota · Argentina · WhatsApp: +549 2920 667796</p>
      </div>
    </div>
  )
}
