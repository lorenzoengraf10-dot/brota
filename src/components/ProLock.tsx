import { Lock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

interface Props {
  children: React.ReactNode
  feature?: string
}

export default function ProLock({ children, feature }: Props) {
  const { user } = useAuthStore()
  const { addNotification } = useAppStore()

  if (user?.plan === 'pro') return <>{children}</>

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => addNotification({ title: 'Función Pro', message: `"${feature ?? 'Esta función'}" requiere el plan Pro.`, type: 'info' })}
    >
      <div className="pointer-events-none opacity-40 select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm border border-[#e5e0d5]">
          <Lock size={14} className="text-[#059669]" />
          <span className="text-xs font-semibold text-gray-700">Pro</span>
        </div>
      </div>
    </div>
  )
}
