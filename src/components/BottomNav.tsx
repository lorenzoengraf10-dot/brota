import { LayoutDashboard, ShoppingCart, Package, Users, CreditCard, Share2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const tabs = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'expenses', label: 'Gastos', icon: CreditCard },
  { id: 'social', label: 'Redes', icon: Share2 }
] as const

export default function BottomNav() {
  const { currentView, setView } = useAppStore()

  return (
    <nav className="flex bg-white border-t border-[#e5e0d5] sticky bottom-0 z-40">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
            currentView === id ? 'text-[#059669]' : 'text-gray-400'
          }`}
        >
          <Icon size={20} strokeWidth={currentView === id ? 2.5 : 1.5} />
          {label}
        </button>
      ))}
    </nav>
  )
}
