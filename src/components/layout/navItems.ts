import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, ShoppingBag, Package, Users, CreditCard, CalendarDays, Tag, BarChart2, Settings } from 'lucide-react'
import type { View } from '@/store/useStore'

export interface NavItem {
  id: View
  label: string
  icon: LucideIcon
}

// Tabs del BottomNav (mobile): solo lo esencial
export const mainTabs: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'orders', label: 'Ventas', icon: ShoppingBag },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'expenses', label: 'Gastos', icon: CreditCard },
  { id: 'calendar', label: 'Agenda', icon: CalendarDays },
]

// El sidebar de desktop muestra además las secciones secundarias
export const extraItems: NavItem[] = [
  { id: 'groups', label: 'Grupos', icon: Tag },
  { id: 'social', label: 'Redes', icon: BarChart2 },
  { id: 'settings', label: 'Configuración', icon: Settings },
]
