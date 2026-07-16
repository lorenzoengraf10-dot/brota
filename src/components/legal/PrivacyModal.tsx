import { ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'

// Bloque de contenido: string = párrafo; string[] = lista con viñetas
type Block = string | string[]
interface Section {
  h: string
  body: Block[]
}

const UPDATED = 'Actualizado: julio 2026'
const CONTACT_WA = '+54 9 2920 66-7796'

const SECTIONS: Section[] = [
  {
    h: '1. Quiénes somos',
    body: [
      'Brota es una aplicación de gestión pensada para emprendedores y pequeños negocios de Argentina. Permite registrar ventas, pedidos, productos, clientes, gastos y otras tareas del día a día desde el celular o la computadora.',
      'Esta Política de Privacidad explica qué información recopilamos, cómo la usamos, con quién la compartimos y qué derechos tenés sobre tus datos. Al usar Brota, aceptás las prácticas descritas en este documento.',
      'El tratamiento de datos personales se realiza conforme a la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina y su normativa complementaria. La autoridad de control es la Agencia de Acceso a la Información Pública (AAIP).',
    ],
  },
  {
    h: '2. Qué información recopilamos',
    body: [
      'Recopilamos únicamente la información necesaria para que la app funcione. Podemos distinguir tres tipos:',
      'a) Datos de tu cuenta: el correo electrónico con el que te registrás y las credenciales de acceso. La contraseña es gestionada de forma segura por nuestro proveedor de autenticación y nunca la almacenamos ni la vemos en texto plano.',
      'b) Datos que cargás vos mismo en la app, entre ellos:',
      [
        'Información de tu negocio: nombre del emprendimiento, moneda, datos de contacto y, si activás el catálogo, descripción, horarios, dirección y redes sociales.',
        'Productos: nombre, precios, costos, stock, variantes y fotos que subas.',
        'Clientes: nombre, teléfono, edad, género, notas y grupos que crees.',
        'Ventas y pedidos: ítems, importes, descuentos, medio de pago, estado de entrega y deudas (fiado).',
        'Gastos, eventos de la agenda y métricas de redes sociales que cargues manualmente.',
      ],
      'c) Datos técnicos y de uso: de forma agregada y anónima podemos registrar información sobre cómo se usa la app (por ejemplo, qué secciones se visitan o qué funciones se utilizan), además de datos técnicos básicos del dispositivo y navegador. Esto se detalla en la sección de Cookies.',
    ],
  },
  {
    h: '3. Datos de tus clientes (tu responsabilidad)',
    body: [
      'Cuando cargás datos de terceros —por ejemplo, el nombre y el teléfono de tus clientes— vos sos el responsable de esa información frente a esas personas, y Brota actúa únicamente como encargado del tratamiento: guardamos y procesamos esos datos siguiendo tus instrucciones para que puedas usar la app.',
      'Es tu responsabilidad contar con el consentimiento de tus clientes para registrar sus datos y usarlos (por ejemplo, para enviarles recordatorios por WhatsApp), así como respetar sus derechos de acceso, rectificación y supresión. Te recomendamos cargar solo la información que realmente necesites para tu operación.',
    ],
  },
  {
    h: '4. Para qué usamos tu información',
    body: [
      'Usamos tus datos exclusivamente para los siguientes fines:',
      [
        'Brindarte el servicio: mostrarte tu propia información y permitirte gestionar tu negocio.',
        'Sincronizar tus datos entre tus dispositivos y mantener una copia disponible aunque estés sin conexión.',
        'Autenticarte de forma segura y proteger tu cuenta.',
        'Mejorar la app: entender de forma agregada qué funciones son más útiles.',
        'Comunicarnos con vos por temas de soporte o cambios importantes en el servicio, cuando corresponda.',
      ],
      'No usamos tus datos para publicidad de terceros ni los vendemos a nadie.',
    ],
  },
  {
    h: '5. Base legal del tratamiento',
    body: [
      'Tratamos tus datos personales sobre la base de tu consentimiento, que otorgás al registrarte y utilizar la app, y en la medida necesaria para ejecutar la prestación del servicio que solicitás. Para las cookies analíticas, solicitamos tu consentimiento explícito y podés rechazarlas sin que la app deje de funcionar.',
    ],
  },
  {
    h: '6. Cookies y almacenamiento local',
    body: [
      'Brota utiliza dos tipos de tecnologías de almacenamiento en tu dispositivo:',
      'a) Almacenamiento local (localStorage) y caché de la app: guardamos tus datos en tu propio dispositivo para que la aplicación funcione de forma rápida y también sin conexión a internet (modo offline). Esta información es esencial para el funcionamiento y no se comparte con terceros.',
      'b) Cookies de analítica (Google Analytics 4): nos ayudan a entender, de forma agregada y anónima, cómo se usa la app para poder mejorarla. Estas cookies solo se activan si las aceptás en el aviso de cookies. Podés rechazarlas o cambiar tu elección en cualquier momento, y la app seguirá funcionando con normalidad.',
    ],
  },
  {
    h: '7. Con quién compartimos tu información',
    body: [
      'No vendemos ni alquilamos tus datos personales. Solo los compartimos con proveedores de servicios que nos permiten operar la app, y únicamente en lo necesario para prestarte el servicio:',
      [
        'Proveedor de base de datos y autenticación (Supabase): almacena de forma segura tu cuenta y los datos de tu negocio.',
        'Proveedor de infraestructura y distribución (Cloudflare): entrega la aplicación a tu dispositivo.',
        'Herramienta de analítica (Google Analytics): mide el uso agregado de la app, solo si aceptás las cookies.',
      ],
      'Además, cuando usás funciones como “enviar por WhatsApp”, se abre WhatsApp con un mensaje que vos decidís enviar; en ese momento, ese contenido queda sujeto a las políticas de WhatsApp. Lo mismo aplica a los enlaces a Instagram o TikTok que configures en tu catálogo.',
      'También podríamos divulgar información si una autoridad competente lo requiere legalmente o para proteger derechos, seguridad o el cumplimiento de la ley.',
    ],
  },
  {
    h: '8. Transferencia internacional de datos',
    body: [
      'Algunos de nuestros proveedores pueden almacenar o procesar información en servidores ubicados fuera de la Argentina. En esos casos, procuramos que la transferencia se realice hacia proveedores que ofrezcan niveles adecuados de protección de datos, en línea con la Ley 25.326. Al utilizar Brota, prestás tu consentimiento para dicha transferencia cuando resulte necesaria para el funcionamiento del servicio.',
    ],
  },
  {
    h: '9. Conservación de los datos',
    body: [
      'Conservamos tus datos mientras mantengas tu cuenta activa y sean necesarios para prestarte el servicio. Si solicitás la eliminación de tu cuenta, borramos tu información de nuestros sistemas dentro de un plazo razonable, salvo que debamos conservar algún dato por obligaciones legales.',
      'Los datos guardados localmente en tu dispositivo se eliminan al cerrar sesión o al borrar los datos de la aplicación desde tu navegador.',
    ],
  },
  {
    h: '10. Seguridad de la información',
    body: [
      'Aplicamos medidas técnicas y organizativas razonables para proteger tu información:',
      [
        'Las comunicaciones entre la app y nuestros servidores viajan cifradas (HTTPS).',
        'Controles de acceso que garantizan que cada usuario solo pueda ver y modificar sus propios datos.',
        'La contraseña la administra nuestro proveedor de autenticación; no la almacenamos.',
      ],
      'Ningún sistema es 100% infalible. Te recomendamos usar una contraseña fuerte, no compartir tu acceso y cerrar sesión en dispositivos que no sean tuyos.',
    ],
  },
  {
    h: '11. Tus derechos',
    body: [
      'De acuerdo con la Ley 25.326, tenés derecho a:',
      [
        'Acceder a los datos personales que tenemos sobre vos.',
        'Rectificar o actualizar datos inexactos o desactualizados.',
        'Solicitar la supresión (eliminación) de tus datos y de tu cuenta.',
        'Retirar tu consentimiento para el uso de cookies analíticas en cualquier momento.',
      ],
      `Para ejercer estos derechos, escribinos por WhatsApp al ${CONTACT_WA}. Responderemos tu solicitud en los plazos que establece la normativa.`,
      'El titular de los datos personales tiene la facultad de ejercer el derecho de acceso en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo. La AAIP, órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan en relación con el incumplimiento de las normas sobre protección de datos personales.',
    ],
  },
  {
    h: '12. Menores de edad',
    body: [
      'Brota está pensada para personas mayores de edad que gestionan un emprendimiento o negocio. No recopilamos de forma consciente datos de menores de edad. Si creés que un menor nos proporcionó datos, contactanos para eliminarlos.',
    ],
  },
  {
    h: '13. Servicios y enlaces de terceros',
    body: [
      'La app puede incluir enlaces o integraciones con servicios de terceros (WhatsApp, Instagram, TikTok, entre otros). Esta Política de Privacidad no cubre las prácticas de esos servicios; te recomendamos leer sus propias políticas de privacidad.',
    ],
  },
  {
    h: '14. Cambios en esta política',
    body: [
      'Podemos actualizar esta Política de Privacidad para reflejar cambios en la app, en nuestros proveedores o en la normativa. Cuando lo hagamos, actualizaremos la fecha que figura al inicio. Si los cambios son significativos, procuraremos avisarte dentro de la app.',
    ],
  },
  {
    h: '15. Contacto',
    body: [
      `Si tenés dudas sobre esta Política de Privacidad o sobre el tratamiento de tus datos, escribinos:`,
      [
        'Brota · Argentina',
        `WhatsApp: ${CONTACT_WA}`,
      ],
    ],
  },
]

export default function PrivacyModal() {
  const { setView } = useStore()
  return (
    <div className="flex flex-col h-full bg-cream">
      <header className="flex items-center gap-3 px-4 py-3 bg-surface/85 backdrop-blur-md border-b border-black/5 sticky top-0 z-10">
        <button onClick={() => setView('landing')} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all">
          <ArrowLeft size={20} className="text-ink" />
        </button>
        <h1 className="font-bold text-ink">Política de Privacidad</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs text-ink-soft mb-1">{UPDATED} · Ley 25.326 (Argentina)</p>
        <p className="text-sm text-ink-soft leading-relaxed mb-5">
          Tu privacidad nos importa. Este documento explica en detalle cómo tratamos tu
          información y la de tu negocio.
        </p>

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
          Este documento tiene fines informativos y describe las prácticas de Brota. No
          constituye asesoramiento legal.
        </p>
      </div>
    </div>
  )
}
