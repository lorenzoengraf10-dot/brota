import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, ShoppingBag, Package, Users, CreditCard, CalendarDays } from 'lucide-react'
import { useStore, type View } from '@/store/useStore'

const tabs: Array<{ id: View; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'orders', label: 'Ventas', icon: ShoppingBag },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'expenses', label: 'Gastos', icon: CreditCard },
  { id: 'calendar', label: 'Agenda', icon: CalendarDays },
]

export default function BottomNav() {
  const { currentView, setView } = useStore()

  return (
    <nav className="flex bg-surface border-t border-black/5 sticky bottom-0 z-40">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = currentView === id
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              active ? 'text-brand-600' : 'text-ink-soft'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
