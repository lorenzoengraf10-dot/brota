import type { Order } from '@/types'
import { formatCurrency, formatDate } from './format'

export function orderTotal(order: Order): number {
  const subtotal = order.items.reduce(
    (a, i) => a + i.unitSalePrice * i.quantity,
    0
  )
  const discountAmt =
    order.discountType === 'percent'
      ? subtotal * (order.discount / 100)
      : order.discount
  return Math.max(0, subtotal - discountAmt)
}

export function orderSubtotal(order: Order): number {
  return order.items.reduce((a, i) => a + i.unitSalePrice * i.quantity, 0)
}

export function buildReceipt(order: Order, businessName: string): string {
  const lines: string[] = []
  lines.push(`🌱 *${businessName}*`)
  lines.push(`📋 Pedido #${order.id.slice(-6).toUpperCase()}`)
  lines.push(`📅 ${formatDate(order.date)}`)
  if (order.dueDate) {
    lines.push(`🚚 Entrega: ${formatDate(order.dueDate)}`)
  }
  lines.push('')
  lines.push('*Productos:*')
  order.items.forEach((item) => {
    lines.push(
      `• ${item.name} x${item.quantity} — ${formatCurrency(item.unitSalePrice * item.quantity)}`
    )
  })
  lines.push('')
  const subtotal = orderSubtotal(order)
  if (order.discount > 0) {
    const discountText =
      order.discountType === 'percent'
        ? `${order.discount}%`
        : formatCurrency(order.discount)
    lines.push(`🏷️ Descuento: ${discountText}`)
  }
  lines.push(`💰 *Total: ${formatCurrency(orderTotal(order))}*`)
  lines.push(`💳 Pago: ${order.paymentMethod}`)
  if (order.note) lines.push(`📝 ${order.note}`)
  return lines.join('\n')
}

export function openWhatsApp(phone: string, message: string): void {
  const clean = phone.replace(/\D/g, '')
  const num = clean ? (clean.startsWith('54') ? clean : `54${clean}`) : ''
  window.open(
    `https://wa.me/${num}?text=${encodeURIComponent(message)}`,
    '_blank'
  )
}
