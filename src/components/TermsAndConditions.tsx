import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface Props { onBack: () => void }

export default function TermsAndConditions({ onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="min-h-full bg-[#f6f2e8]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-[#e5e0d5] bg-white sticky top-0">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Términos y Condiciones</h1>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-gray-700 leading-relaxed">
        <p className="text-xs text-gray-400">Última actualización: junio de 2026</p>

        <section>
          <h2 className="font-bold text-base mb-2">1. Aceptación</h2>
          <p>Al registrarte y usar Brota, aceptás estos Términos y Condiciones. Si no estás de acuerdo, no uses la aplicación.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. Descripción del servicio</h2>
          <p>Brota es una herramienta de gestión para emprendedores que permite registrar ventas, productos, clientes y gastos. El servicio se ofrece en modalidad <strong>free</strong> (con limitaciones) y <strong>pro</strong> (sin limitaciones).</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. Uso aceptable</h2>
          <p>Aceptás usar Brota únicamente para actividades lícitas relacionadas con la gestión de tu emprendimiento. Queda prohibido:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Usar la app para actividades ilegales o fraudulentas.</li>
            <li>Intentar acceder a datos de otros usuarios.</li>
            <li>Realizar ingeniería inversa o copiar el software.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. Responsabilidad de los datos</h2>
          <p>Sos responsable de la exactitud y legalidad de los datos que cargás en la app. Brota no verifica la información que ingresás y no se responsabiliza por errores en los registros.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. Disponibilidad del servicio</h2>
          <p>Nos esforzamos por mantener la app disponible 24/7, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimientos sin previo aviso.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">6. Modificaciones</h2>
          <p>Podemos modificar estos Términos en cualquier momento. Te notificaremos los cambios importantes mediante la app. El uso continuado implica la aceptación de los nuevos términos.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">7. Planes y pagos</h2>
          <p>El plan free es gratuito con límites de uso. El plan pro tiene un costo mensual indicado en la app. Los cobros son procesados por terceros (Mercado Pago u otro proveedor) y no almacenamos datos de tarjetas.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">8. Limitación de responsabilidad</h2>
          <p>Brota no se responsabiliza por pérdidas económicas derivadas del uso de la app, errores en los datos ingresados por el usuario, ni por interrupciones del servicio.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">9. Ley aplicable</h2>
          <p>Estos términos se rigen por las leyes de la <strong>República Argentina</strong>. Cualquier controversia será sometida a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.</p>
        </section>
      </div>
    </motion.div>
  )
}
