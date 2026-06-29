import type { Sale, Expense, Product, Client } from '@/types'

function esc(v: string | number | undefined): string {
  return `"${String(v ?? '').replace(/"/g, '""')}"`
}

function toCSV(headers: string[], rows: (string | number | undefined)[][]): string {
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

const today = () => new Date().toISOString().slice(0, 10)

export function exportSales(sales: Sale[]) {
  dl(
    `brota-ventas-${today()}.csv`,
    toCSV(
      ['Fecha', 'Cliente', 'Productos', 'Subtotal', 'Descuento', 'Total', 'Método de pago', 'Estado pago', 'Estado pedido', 'Fecha entrega', 'Notas'],
      sales.map((s) => [
        new Date(s.createdAt).toLocaleDateString('es-AR'),
        s.clientName ?? 'Cliente ocasional',
        s.items.map((i) => `${i.productName} x${i.quantity}`).join(' | '),
        s.subtotal ?? s.total,
        s.discountAmount ?? '',
        s.total,
        s.paymentMethod,
        s.status,
        s.orderStatus ?? '',
        s.deliveryDate
          ? new Date(s.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR')
          : '',
        s.notes ?? '',
      ])
    )
  )
}

export function exportExpenses(expenses: Expense[]) {
  dl(
    `brota-gastos-${today()}.csv`,
    toCSV(
      ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Notas'],
      expenses.map((e) => [e.date, e.description, e.category, e.amount, e.notes ?? ''])
    )
  )
}

export function exportProducts(products: Product[]) {
  dl(
    `brota-productos-${today()}.csv`,
    toCSV(
      ['Nombre', 'Categoría', 'Precio de venta', 'Costo', 'Stock', 'Activo'],
      products.map((p) => [
        p.name,
        p.category ?? '',
        p.price,
        p.cost ?? '',
        p.stock ?? '',
        p.active ? 'Sí' : 'No',
      ])
    )
  )
}

export function exportClients(clients: Client[]) {
  dl(
    `brota-clientes-${today()}.csv`,
    toCSV(
      ['Nombre', 'Teléfono', 'Email', 'Dirección', 'Notas'],
      clients.map((c) => [c.name, c.phone ?? '', c.email ?? '', c.address ?? '', c.notes ?? ''])
    )
  )
}
