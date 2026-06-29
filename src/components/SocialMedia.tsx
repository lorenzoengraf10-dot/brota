import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Globe, MessageCircle, ExternalLink, Save } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import type { SocialLink, BusinessProfile } from '@/types'

const PLATFORMS: { id: SocialLink['platform']; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@tu_negocio' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/tu-negocio' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '+54911XXXXXXXX' },
  { id: 'website', label: 'Sitio web', icon: Globe, placeholder: 'https://tu-negocio.com' },
]

export default function SocialMedia() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({})
  const [links, setLinks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('business_profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as BusinessProfile)
          const map: Record<string, string> = {}
          ;(data.social_links as SocialLink[] ?? []).forEach((l) => { map[l.platform] = l.url })
          setLinks(map)
        }
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const socialLinks: SocialLink[] = PLATFORMS
      .filter((p) => links[p.id]?.trim())
      .map((p) => ({ platform: p.id, url: links[p.id].trim() }))
    const payload = {
      user_id: user.id,
      business_name: profile.businessName ?? user.businessName ?? 'Mi negocio',
      description: profile.description,
      phone: profile.phone,
      social_links: socialLinks,
      updated_at: new Date().toISOString()
    }
    await supabase.from('business_profiles').upsert(payload)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-4 space-y-4">
      <h2 className="text-xl font-bold">Redes sociales</h2>

      <div className="bg-white rounded-2xl p-4 border border-[#e5e0d5] space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Perfil del negocio</h3>
        <input
          value={profile.businessName ?? ''}
          onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))}
          placeholder="Nombre del negocio"
          className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
        />
        <textarea
          value={profile.description ?? ''}
          onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
          placeholder="Descripción breve del negocio"
          rows={3}
          className="w-full px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm resize-none focus:outline-none focus:border-[#059669]"
        />
        <input
          value={profile.phone ?? ''}
          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
          placeholder="Teléfono de contacto"
          type="tel"
          className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
        />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#e5e0d5] space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Tus redes</h3>
        {PLATFORMS.map(({ id, label, icon: Icon, placeholder }) => (
          <div key={id}>
            <label className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
              <Icon size={14} />{label}
            </label>
            <div className="flex gap-2">
              <input
                value={links[id] ?? ''}
                onChange={(e) => setLinks((l) => ({ ...l, [id]: e.target.value }))}
                placeholder={placeholder}
                className="flex-1 px-3 py-2.5 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
              />
              {links[id] && (
                <a href={links[id].startsWith('http') ? links[id] : `https://${links[id]}`} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#e5e0d5] text-gray-400 hover:text-[#059669]">
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${
          saved ? 'bg-green-100 text-[#059669]' : 'bg-[#059669] text-white'
        } disabled:opacity-50`}
      >
        <Save size={16} />{saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </motion.div>
  )
}
