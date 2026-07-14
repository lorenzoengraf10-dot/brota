import { Sprout } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { mainTabs, extraItems, type NavItem } from './navItems'

// Navegación de escritorio (lg:+). En mobile la reemplaza el BottomNav.
export default function Sidebar() {
  const { currentView, setView, business } = useStore()

  function Item({ id, label, icon: Icon }: NavItem) {
    const active = currentView === id
    return (
      <button
        onClick={() => setView(id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          active ? 'bg-brand-600/10 text-brand-600' : 'text-ink-soft hover:bg-black/5'
        }`}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
        {label}
      </button>
    )
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-surface border-r border-black/5 p-3">
      <button
        onClick={() => setView('dashboard')}
        className="flex items-center gap-2 px-3 py-3 mb-2"
      >
        <span className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
          <Sprout size={16} color="white" strokeWidth={2.5} />
        </span>
        <div className="text-left min-w-0">
          <p className="font-bold text-ink text-[15px] tracking-tight leading-tight">Brota</p>
          {business?.name && <p className="text-[11px] text-ink-soft truncate">{business.name}</p>}
        </div>
      </button>
      <nav className="space-y-0.5">
        {mainTabs.map((t) => <Item key={t.id} {...t} />)}
      </nav>
      <div className="my-2 border-t border-black/5" />
      <nav className="space-y-0.5">
        {extraItems.map((t) => <Item key={t.id} {...t} />)}
      </nav>
    </aside>
  )
}
