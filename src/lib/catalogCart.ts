import { formatCurrency } from './format'

// Línea del carrito del catálogo público (estado local del visitante)
export interface CartLine {
  productId: string
  variantId: string | null
  name: string // nombre a mostrar, con variante incluida
  price: number
  qty: number
  maxStock: number | null // foto del stock al cargar; null = sin límite
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.price * l.qty, 0)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.qty, 0)
}

// Normaliza un número argentino para wa.me (prefijo 54 si falta)
export function normalizeWa(raw: string): string {
  const clean = raw.replace(/\D/g, '')
  if (!clean) return ''
  return clean.startsWith('54') ? clean : `54${clean}`
}

// Mensaje de WhatsApp con el pedido armado
export function buildCartMessage(businessName: string, lines: CartLine[]): string {
  const items = lines
    .map((l) => `• ${l.qty}× ${l.name} — ${formatCurrency(l.price * l.qty)}`)
    .join('\n')
  return `Hola! Quiero hacer este pedido de *${businessName}* 🌱\n${items}\n*Total: ${formatCurrency(cartTotal(lines))}*`
}

export function cartWaLink(whatsapp: string, businessName: string, lines: CartLine[]): string {
  return `https://wa.me/${normalizeWa(whatsapp)}?text=${encodeURIComponent(buildCartMessage(businessName, lines))}`
}
