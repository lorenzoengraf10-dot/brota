import { useStore } from '@/store/useStore'
import { mainTabs } from './navItems'

export default function BottomNav() {
  const { currentView, setView } = useStore()

  return (
    <nav className="flex lg:hidden fixed bottom-6 left-4 right-4 mx-auto max-w-lg z-40 bg-surface/85 backdrop-blur-md rounded-2xl border border-black/[0.03] dark:border-white/[0.03] shadow-lg shadow-black/5">
      {mainTabs.map(({ id, label, icon: Icon }) => {
        const active = currentView === id
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-200 active:scale-95 ${
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
