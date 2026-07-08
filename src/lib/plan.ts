import type { Plan } from '@/types'

export const FREE_LIMITS = {
  products: 21,
  clients: 32,
  ordersPerMonth: 42,
  expensesPerMonth: 21,
} as const

export const PRO_PRICE = '$4.000/mes'
export const WA_NUMBER = '5492920667796'
export const APP_URL = 'https://brotaonline.com'

// Mensaje de recomendación boca-a-boca (remarketing orgánico)
export const SHARE_MESSAGE = `Estoy usando Brota 🌱 para organizar mi emprendimiento: ventas, pedidos, clientes y gastos, todo desde el celu. Es gratis, probala: ${APP_URL}`

export function waShareLink(): string {
  return `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}`
}

export const PRO_FEATURES = [
  'Emprendimientos ilimitados',
  'Productos, clientes, ventas y gastos ilimitados',
  'Exportar ventas, clientes y gastos a CSV/Excel',
  'Sección Redes Sociales con métricas semanales',
  'Sincronización en la nube en todos los dispositivos',
]

export function waProLink(email?: string): string {
  const msg = `Hola! Quiero activar el plan Pro de Brota${
    email ? ` (mi email: ${email})` : ''
  } 🌱`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

export function waSupportLink(email?: string): string {
  const msg = `Hola! Necesito ayuda con Brota${email ? ` (${email})` : ''}`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

export function waDeleteLink(email: string): string {
  const msg = `Hola! Quiero eliminar mi cuenta de Brota (${email})`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

export function isAtLimit(
  plan: Plan,
  resource: keyof typeof FREE_LIMITS,
  count: number
): boolean {
  if (plan === 'pro') return false
  return count >= FREE_LIMITS[resource]
}

export function canUseSocialMedia(plan: Plan): boolean {
  return plan === 'pro'
}

export function canExport(plan: Plan): boolean {
  return plan === 'pro'
}
