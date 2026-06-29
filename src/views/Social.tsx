import { useState } from 'react'
import { Instagram, Music2, Facebook, Lock, Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { canUseSocialMedia } from '@/lib/plan'
import { isoWeekStart, formatShortDate } from '@/lib/format'
import UpgradeModal from '@/components/plan/UpgradeModal'
import type { Platform, SocialMetric } from '@/types'

const PLATFORMS: { id: Platform; label: string; icon: typeof Instagram; color: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: '#000000' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
]

export default function Social() {
  const { user } = useStore()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (!canUseSocialMedia(user?.plan ?? 'free')) {
    return (
      <div className="pb-24 px-4 pt-16 flex flex-col items-center text-center gap-4">
        <span className="w-16 h-16 rounded-2xl bg-azure-600/10 flex items-center justify-center">
          <Lock size={26} className="text-azure-600" />
        </span>
        <div>
          <h2 className="font-bold text-ink text-lg mb-1">Redes Sociales es Pro</h2>
          <p className="text-ink-soft text-sm max-w-xs">
            Llevá el registro semanal de alcance, interacciones y seguidores nuevos de tus redes.
          </p>
        </div>
        <button
          onClick={() => setShowUpgrade(true)}
          className="bg-brand-600 text-white font-semibold py-3 px-6 rounded-2xl text-sm"
        >
          Quiero ser Pro
        </button>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    )
  }

  return <SocialPro />
}

function SocialPro() {
  const { socialMetrics, business, upsertMetric } = useStore()
  const [platform, setPlatform] = useState<Platform>('instagram')

  const weekStart = isoWeekStart()
  const history = socialMetrics
    .filter((m) => m.platform === platform)
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))

  const current = history.find((m) => m.weekStart === weekStart) ?? null

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 flex gap-2">
        {PLATFORMS.map((p) => {
          const Icon = p.icon
          const active = platform === p.id
          return (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-medium transition-colors ${
                active ? 'bg-surface shadow-sm' : 'bg-transparent text-ink-soft'
              }`}
            >
              <Icon size={20} style={{ color: active ? p.color : undefined }} className={active ? '' : 'text-ink-soft'} />
              {p.label}
            </button>
          )
        })}
      </div>

      <div className="px-4 mt-4">
        <MetricForm
          key={platform + weekStart}
          businessId={business?.id ?? ''}
          platform={platform}
          weekStart={weekStart}
          initial={current}
          onSave={upsertMetric}
        />
      </div>

      <div className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Historial</h3>
        {history.length === 0 && (
          <p className="text-ink-soft text-sm text-center py-8">Todavía no hay registros para esta red.</p>
        )}
        <div className="space-y-2">
          {history.map((m) => (
            <div key={m.id} className="bg-surface rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-ink-soft mb-2">
                Semana del {formatShortDate(m.weekStart)}
              </p>
              <div className="grid grid-cols-4 gap-2">
                <Stat label="Alcance" value={m.reach} />
                <Stat label="Interac." value={m.interactions} />
                <Stat label="Nuevos" value={m.newFollowers} />
                <Stat label="Posts" value={m.posts} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold text-ink">{value}</p>
      <p className="text-[10px] text-ink-soft">{label}</p>
    </div>
  )
}

function MetricForm({
  businessId, platform, weekStart, initial, onSave,
}: {
  businessId: string
  platform: Platform
  weekStart: string
  initial: SocialMetric | null
  onSave: (m: Omit<SocialMetric, 'id' | 'createdAt'>) => Promise<void>
}) {
  const [reach, setReach] = useState(initial?.reach ?? 0)
  const [interactions, setInteractions] = useState(initial?.interactions ?? 0)
  const [newFollowers, setNewFollowers] = useState(initial?.newFollowers ?? 0)
  const [posts, setPosts] = useState(initial?.posts ?? 0)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({ businessId, platform, weekStart, reach, interactions, newFollowers, posts })
    setSaving(false)
  }

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
        Esta semana ({formatShortDate(weekStart)})
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Alcance" value={reach} onChange={setReach} />
        <Field label="Interacciones" value={interactions} onChange={setInteractions} />
        <Field label="Nuevos seguidores" value={newFollowers} onChange={setNewFollowers} />
        <Field label="Publicaciones" value={posts} onChange={setPosts} />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <Plus size={16} />
        {saving ? 'Guardando...' : 'Guardar métricas'}
      </button>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[11px] text-ink-soft block mb-1">{label}</label>
      <input
        type="number" min="0" value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-black/5 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-ink"
      />
    </div>
  )
}
