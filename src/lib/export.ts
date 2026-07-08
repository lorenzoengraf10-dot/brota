import type { Order, Expense, Product, Customer } from '@/types'
import { formatDate, formatCurrency, today } from './format'
import { orderTotal } from './receipt'

function esc(v: string | number | undefined): string {
  return `"${String(v ?? '').replace(/"/g, '""')}"`
}

function toCSV(
  headers: string[],
  rows: (string | number | undefined)[][]
): string {
  return '﻿' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}

function dl(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const todayStr = today

export function exportOrders(orders: Order[]) {
  dl(
    `brota-ventas-${todayStr()}.csv`,
    toCSV(
      ['Fecha', 'Cliente', 'Productos', 'Descuento', 'Total', 'Pago', 'Pagado', 'Estado', 'Entrega', 'Nota'],
      orders.map((o) => [
        formatDate(o.date),
        o.customerName || 'Cliente ocasional',
        o.items.map((i) => `${i.name} x${i.quantity}`).join(' | '),
        o.discount > 0
          ? o.discountType === 'percent' ? `${o.discount}%` : formatCurrency(o.discount)
          : '',
        orderTotal(o),
        o.paymentMethod,
        o.paid === false ? 'No (fiado)' : 'Sí',
        o.status === 'pending' ? 'Pendiente' : o.status === 'ready' ? 'Listo' : 'Completado',
        o.dueDate ? formatDate(o.dueDate) : '',
        o.note,
      ])
    )
  )
}

export function exportExpenses(expenses: Expense[]) {
  dl(
    `brota-gastos-${todayStr()}.csv`,
    toCSV(
      ['Fecha', 'Categoría', 'Monto', 'Nota'],
      expenses.map((e) => [formatDate(e.date), e.category, e.amount, e.note])
    )
  )
}

export function exportProducts(products: Product[]) {
  dl(
    `brota-productos-${todayStr()}.csv`,
    toCSV(
      ['Nombre', 'Precio venta', 'Costo', 'Stock'],
      products.map((p) => [
        p.name,
        p.salePrice,
        p.costPrice,
        p.stock ?? 'Sin inventario',
      ])
    )
  )
}

export function exportCustomers(customers: Customer[]) {
  dl(
    `brota-clientes-${todayStr()}.csv`,
    toCSV(
      ['Nombre', 'Teléfono', 'Edad', 'Sexo', 'Notas'],
      customers.map((c) => [
        c.name,
        c.phone,
        c.age ?? '',
        c.sex,
        c.notes,
      ])
    )
  )
}
