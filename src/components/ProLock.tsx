import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import UpgradeModal from './UpgradeModal'

interface Props {
  children: React.ReactNode
  feature?: string
}

export default function ProLock({ children, feature: _feature }: Props) {
  const { user } = useAuthStore()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (user?.plan === 'pro') return <>{children}</>

  return (
    <>
      <div className="relative cursor-pointer" onClick={() => setShowUpgrade(true)}>
        <div className="pointer-events-none opacity-40 select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm border border-[#e5e0d5]">
            <Lock size={14} className="text-[#059669]" />
            <span className="text-xs font-semibold text-gray-700">Pro</span>
          </div>
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  )
}
