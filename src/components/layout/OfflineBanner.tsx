import { WifiOff, RefreshCw, CloudUpload } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function OfflineBanner() {
  const { online, pendingOps, syncing, flushQueue } = useStore()

  if (!online) {
    return (
      <div className="flex items-center gap-2 bg-ink/90 dark:bg-white/15 text-white text-xs px-4 py-2">
        <WifiOff size={13} className="shrink-0" />
        <span className="flex-1">
          Sin conexión — tus cambios se guardan en el celu y se sincronizan solos
        </span>
        {pendingOps.length > 0 && (
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
            {pendingOps.length}
          </span>
        )}
      </div>
    )
  }

  if (pendingOps.length > 0) {
    return (
      <button
        onClick={() => flushQueue()}
        className="w-full flex items-center gap-2 bg-azure-600 text-white text-xs px-4 py-2"
      >
        {syncing ? (
          <RefreshCw size={13} className="shrink-0 animate-spin" />
        ) : (
          <CloudUpload size={13} className="shrink-0" />
        )}
        <span className="flex-1 text-left">
          {syncing
            ? `Sincronizando ${pendingOps.length} cambio${pendingOps.length !== 1 ? 's' : ''}...`
            : `${pendingOps.length} cambio${pendingOps.length !== 1 ? 's' : ''} por sincronizar — tocá para reintentar`}
        </span>
      </button>
    )
  }

  return null
}
