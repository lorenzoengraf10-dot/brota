// Límites del plan gratuito (generosos para el crecimiento)
export const FREE_LIMITS = {
  products: 100,
  clients: 200,
  salesPerMonth: 500,
}

// Actualizar el precio aquí cuando sea necesario
export const PRO_PRICE = '$ 4.990'

const WA_NUMBER = '5492920667769'

export function waProLink(): string {
  const msg = 'Hola! Me interesa activar el plan Pro de Brota 🌱 ¿Me podés dar más info?'
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

export function waDeleteLink(email: string): string {
  const msg = `Hola, quiero eliminar mi cuenta de Brota. Mi email es: ${email}`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

export function waSupportLink(email: string): string {
  const msg = `Hola! Necesito soporte con Brota. Mi email es: ${email}`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

export function isAtLimit(
  plan: 'free' | 'pro',
  resource: keyof typeof FREE_LIMITS,
  count: number
): boolean {
  if (plan === 'pro') return false
  return count >= FREE_LIMITS[resource]
}
