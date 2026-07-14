import { useStore } from '@/store/useStore'
import { mainTabs } from './navItems'

export default function BottomNav() {
  const { currentView, setView } = useStore()

  return (
    <nav className="flex lg:hidden bg-surface border-t border-black/5 sticky bottom-0 z-40">
      {mainTabs.map(({ id, label, icon: Icon }) => {
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
