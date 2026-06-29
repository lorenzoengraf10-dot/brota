import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface Props { onBack: () => void }

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="min-h-full bg-[#f6f2e8]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-[#e5e0d5] bg-white sticky top-0">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-lg">Política de Privacidad</h1>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-gray-700 leading-relaxed">
        <p className="text-xs text-gray-400">Última actualización: junio de 2026</p>

        <section>
          <h2 className="font-bold text-base mb-2">1. Responsable del tratamiento</h2>
          <p>Brota es una aplicación desarrollada para emprendedores argentinos. El responsable del tratamiento de datos es el operador de la aplicación, en cumplimiento de la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la República Argentina.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. Datos que recopilamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Datos de cuenta:</strong> email y contraseña (gestionados por Supabase Auth).</li>
            <li><strong>Datos del negocio:</strong> ventas, productos, clientes, gastos y perfil de redes sociales que vos ingresás voluntariamente.</li>
            <li><strong>Datos de uso:</strong> si aceptás las cookies, Google Analytics recopila datos anónimos de navegación (páginas visitadas, duración de sesión, tipo de dispositivo).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. Finalidad del tratamiento</h2>
          <p>Los datos se usan exclusivamente para:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Brindarte acceso a las funcionalidades de la app.</li>
            <li>Almacenar la información de tu emprendimiento de forma segura.</li>
            <li>Mejorar la experiencia de usuario mediante analítica anónima (solo con tu consentimiento).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. Seguridad y acceso</h2>
          <p>Todos los datos del negocio son <strong>privados y accesibles únicamente por vos</strong>. Utilizamos Supabase con <strong>Row Level Security (RLS)</strong> activado, lo que garantiza que ningún otro usuario puede ver ni modificar tu información.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. Compartición con terceros</h2>
          <p>No compartimos tus datos personales ni los datos de tu negocio con terceros, <strong>excepto</strong>:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>Supabase:</strong> proveedor de base de datos y autenticación (procesador de datos).</li>
            <li><strong>Google Analytics:</strong> solo si aceptás el uso de cookies analíticas, y únicamente datos anónimos de uso.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">6. Tus derechos</h2>
          <p>En virtud de la Ley 25.326, tenés derecho a:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>Acceso:</strong> consultar qué datos tenemos sobre vos.</li>
            <li><strong>Rectificación:</strong> corregir datos incorrectos desde la app.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tu cuenta y todos tus datos (derecho al olvido).</li>
            <li><strong>Portabilidad:</strong> exportar tus datos en formato legible.</li>
          </ul>
          <p className="mt-2">Para ejercer estos derechos, contactanos desde la sección de configuración de la app.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">7. Cookies</h2>
          <p>Usamos cookies de análisis (Google Analytics) solo con tu consentimiento explícito. Podés revocar el consentimiento en cualquier momento desde Configuración.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">8. Retención de datos</h2>
          <p>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, todos los datos asociados son eliminados permanentemente de nuestros servidores.</p>
        </section>
      </div>
    </motion.div>
  )
}
