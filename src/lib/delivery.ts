export function startOfDay(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export type DueState = 'overdue' | 'today' | 'soon' | 'upcoming' | 'none'

export function dueState(dueDate: string | null): DueState {
  if (!dueDate) return 'none'
  const due = startOfDay(dueDate)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.floor(
    (due.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 2) return 'soon'
  return 'upcoming'
}

export function dueLabel(dueDate: string | null): string {
  if (!dueDate) return ''
  const state = dueState(dueDate)
  const formatted = startOfDay(dueDate).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  })
  switch (state) {
    case 'overdue': return `Vencido (${formatted})`
    case 'today': return 'Entrega hoy'
    case 'soon': return `Entrega pronto · ${formatted}`
    case 'upcoming': return `Entrega ${formatted}`
    default: return ''
  }
}

export function dueBadgeClass(state: DueState): string {
  switch (state) {
    case 'overdue': return 'bg-rose-100 text-rose-700'
    case 'today': return 'bg-amber-100 text-amber-700'
    case 'soon': return 'bg-blue-100 text-blue-700'
    case 'upcoming': return 'bg-gray-100 text-gray-600'
    default: return ''
  }
}
