import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'

type Block = string | string[]
interface Section {
  h: string
  body: Block[]
}

const UPDATED = 'Actualizado: julio 2026'
const CONTACT_WA = '+54 9 2920 66-7796'

const SECTIONS: Section[] = [
  {
    h: '1. Aceptación de los términos',
    body: [
      'Al crear una cuenta o utilizar Brota, aceptás estos Términos y Condiciones. Si no estás de acuerdo con ellos, por favor no uses la aplicación.',
    ],
  },
  {
    h: '2. Uso del servicio',
    body: [
      'Brota es una herramienta de gestión para emprendedores y pequeños negocios: permite registrar ventas, pedidos, productos, clientes, gastos y más.',
      'Durante la beta, todas las funciones están disponibles de forma gratuita. El plan gratuito se mantiene para siempre; más adelante existirá un plan Premium opcional con funciones extra.',
      'Te comprometés a usar la app de forma lícita y a no utilizarla para cargar contenido ilegal, ofensivo o que vulnere derechos de terceros.',
    ],
  },
  {
    h: '3. Tu cuenta',
    body: [
      'Sos responsable de la seguridad de tu cuenta y de toda la actividad que ocurra en ella. No compartas tu acceso con otras personas y usá una contraseña segura.',
      'También sos responsable de la información que cargás, incluidos los datos de tus clientes, y de contar con su consentimiento cuando corresponda (ver la Política de Privacidad).',
    ],
  },
  {
    h: '4. Planes y pagos',
    body: [
      'Hoy no existe ningún cobro: Brota es gratis durante la beta. Cuando se lance el plan Premium, será opcional y avisaremos con anticipación dentro de la app.',
      'Los usuarios fundadores (quienes se sumaron durante la beta) tendrán un beneficio especial cuando llegue Premium.',
    ],
  },
  {
    h: '5. Disponibilidad del servicio',
    body: [
      'Hacemos nuestro mejor esfuerzo para que la app esté siempre disponible, pero puede haber interrupciones por mantenimiento, actualizaciones o causas fuera de nuestro control. La app también funciona sin conexión y sincroniza tus datos cuando volvés a tener internet.',
    ],
  },
  {
    h: '6. Tus datos y respaldos',
    body: [
      'Tus datos te pertenecen. Guardamos una copia en la nube y también en tu dispositivo para el modo offline. Aun así, te recomendamos exportar periódicamente tu información (por ejemplo, a CSV) como respaldo propio.',
    ],
  },
  {
    h: '7. Limitación de responsabilidad',
    body: [
      'Brota se ofrece “tal cual”, como una herramienta de apoyo a tu gestión. No nos responsabilizamos por pérdidas de datos causadas por uso incorrecto, fallas de conectividad o de terceros, ni por las decisiones comerciales que tomes en base a la información de la app.',
    ],
  },
  {
    h: '8. Cambios en los términos',
    body: [
      'Podemos actualizar estos Términos para reflejar mejoras en la app o cambios legales. Cuando lo hagamos, actualizaremos la fecha del inicio y, si el cambio es importante, procuraremos avisarte dentro de la app.',
    ],
  },
  {
    h: '9. Contacto',
    body: [
      'Ante cualquier duda sobre estos Términos, escribinos:',
      ['Brota · Argentina', `WhatsApp: ${CONTACT_WA}`],
    ],
  },
]

export default function TermsModal() {
  const { setView } = useStore()
  return (
    <div className="flex flex-col h-full bg-cream">
      <header className="flex items-center gap-3 px-4 py-3 bg-surface/85 backdrop-blur-md border-b border-black/5 sticky top-0 z-10">
        <button onClick={() => setView('landing')} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all">
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="font-bold text-ink">Términos y Condiciones</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs text-ink-soft mb-5">{UPDATED}</p>

        {SECTIONS.map((s) => (
          <section key={s.h} className="mb-5">
            <h2 className="text-[15px] font-bold text-ink mb-1.5">{s.h}</h2>
            {s.body.map((b, i) =>
              Array.isArray(b) ? (
                <ul key={i} className="list-disc pl-5 space-y-1 mb-2">
                  {b.map((li, j) => (
                    <li key={j} className="text-sm text-ink-soft leading-relaxed">{li}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="text-sm text-ink-soft leading-relaxed mb-2">{b}</p>
              )
            )}
          </section>
        ))}

        <p className="text-xs text-ink-soft/70 leading-relaxed border-t border-black/5 pt-4 mt-2">
          Este documento tiene fines informativos. No constituye asesoramiento legal.
        </p>
      </div>
    </div>
  )
}
