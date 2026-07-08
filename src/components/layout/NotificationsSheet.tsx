import { X, BellOff } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDateTime } from '@/lib/format'

const TYPE_DOT: Record<string, string> = {
  info: 'bg-azure-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
}

export default function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markNotificationRead, clearNotifications } = useStore()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-t-3xl max-h-[75vh] flex flex-col max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between p-5 pb-3 border-b border-black/5 shrink-0">
          <h2 className="font-bold text-ink text-lg">Notificaciones</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="text-xs text-ink-soft font-medium px-2 py-1">
                Limpiar
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5">
              <X size={16} className="text-ink" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 pb-8 space-y-2">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <BellOff size={20} className="text-ink-soft" />
              </span>
              <p className="text-ink-soft text-sm">No tenés notificaciones.</p>
            </div>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full flex items-start gap-3 rounded-2xl p-3.5 text-left transition-colors ${
                n.read ? 'opacity-55' : 'bg-black/5 dark:bg-white/5'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[n.type] ?? 'bg-azure-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <p className="text-xs text-ink-soft">{n.message}</p>
                <p className="text-[10px] text-ink-soft/70 mt-0.5">{formatDateTime(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
