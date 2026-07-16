import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function TermsModal() {
  const { setView } = useStore()
  return (
    <div className="flex flex-col h-full bg-cream">
      <header className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-black/5 sticky top-0">
        <button onClick={() => setView('landing')} className="p-2 -ml-2 rounded-full hover:bg-black/5">
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="font-bold text-ink">Términos y Condiciones</h1>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-6 prose prose-sm max-w-none text-ink">
        <p className="text-xs text-ink-soft">Actualizado: julio 2026</p>
        <h3>1. Uso del servicio</h3>
        <p>Brota es una herramienta de gestión para emprendedores. Durante la beta, todas las funciones están disponibles gratis. El plan gratuito se mantiene para siempre; más adelante existirá un plan Premium opcional con funciones extra.</p>
        <h3>2. Cuentas</h3>
        <p>Sos responsable de la seguridad de tu cuenta. No compartas tu link de acceso con otras personas.</p>
        <h3>3. Planes y pagos</h3>
        <p>Hoy no hay ningún cobro. Cuando se lance el plan Premium, será opcional y avisaremos con anticipación. Los usuarios fundadores (los que se sumaron durante la beta) tendrán un beneficio especial.</p>
        <h3>4. Limitación de responsabilidad</h3>
        <p>Brota no se responsabiliza por pérdidas de datos causadas por uso incorrecto de la app o fallas de conectividad.</p>
        <h3>5. Contacto</h3>
        <p>Brota · Argentina · WhatsApp: +549 2920 667796</p>
      </div>
    </div>
  )
}
