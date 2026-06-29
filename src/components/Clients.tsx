import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Users, Phone, Mail } from 'lucide-react'
import { useClientsStore } from '@/store/useClientsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isAtLimit } from '@/lib/plans'
import UpgradeModal from './UpgradeModal'

export default function Clients() {
  const { user } = useAuthStore()
  const { clients, groups, loading, fetch, addClient, removeClient, addGroup, removeGroup } = useClientsStore()
  const [tab, setTab] = useState<'clients' | 'groups'>('clients')
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [groupId, setGroupId] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) fetch(user.id) }, [user])

  const openNewClient = () => {
    if (isAtLimit(user?.plan ?? 'free', 'clients', clients.length)) {
      setShowUpgrade(true)
      return
    }
    setName(''); setPhone(''); setEmail(''); setGroupId('')
    setShowForm(true)
  }

  const handleSaveClient = async () => {
    if (!user || !name.trim()) return
    setSaving(true)
    await addClient({
      userId: user.id,
      name: name.trim(),
      phone: phone || undefined,
      email: email || undefined,
      groupId: groupId || undefined,
    })
    setShowForm(false)
    setSaving(false)
  }

  const handleSaveGroup = async () => {
    if (!user || !newGroup.trim()) return
    await addGroup({ userId: user.id, name: newGroup.trim() })
    setNewGroup('')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Clientes</h2>
        {tab === 'clients' && (
          <button
            onClick={openNewClient}
            className="flex items-center gap-1 px-3 py-2 bg-[#059669] text-white text-sm font-medium rounded-xl"
          >
            <Plus size={16} /> Agregar
          </button>
        )}
      </div>

      <div className="flex rounded-xl bg-[#f6f2e8] p-1">
        {(['clients', 'groups'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t ? 'bg-white shadow text-[#059669]' : 'text-gray-500'
            }`}
          >
            {t === 'clients' ? `Clientes (${clients.length})` : `Grupos (${groups.length})`}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && tab === 'clients' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="bg-white w-full rounded-t-3xl p-5 max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Nuevo cliente</h3>
                <button onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre*"
                  className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                />
                <input
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Teléfono" type="tel"
                  className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                />
                <input
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" type="email"
                  className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
                />
                {groups.length > 0 && (
                  <select
                    value={groupId} onChange={(e) => setGroupId(e.target.value)}
                    className="w-full px-3 py-3 border border-[#e5e0d5] rounded-xl text-sm"
                  >
                    <option value="">Sin grupo</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                )}
                <button
                  onClick={handleSaveClient}
                  disabled={saving || !name}
                  className="w-full py-3 bg-[#059669] text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Agregar cliente'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#059669] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'clients' ? (
        clients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto opacity-30" />
            <p className="mt-2 text-sm">Sin clientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-4 border border-[#e5e0d5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#059669]/10 flex items-center justify-center">
                  <span className="text-[#059669] font-bold text-sm">{c.name[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    {c.phone && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} />{c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail size={10} />{c.email}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => removeClient(c.id)} className="p-1.5 text-rose-400">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={newGroup} onChange={(e) => setNewGroup(e.target.value)}
              placeholder="Nombre del grupo"
              className="flex-1 px-3 py-2 border border-[#e5e0d5] rounded-xl text-sm focus:outline-none focus:border-[#059669]"
            />
            <button
              onClick={handleSaveGroup}
              disabled={!newGroup.trim()}
              className="px-4 py-2 bg-[#059669] text-white text-sm rounded-xl disabled:opacity-50"
            >
              Crear
            </button>
          </div>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Sin grupos creados</div>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="bg-white rounded-xl p-3 border border-[#e5e0d5] flex items-center justify-between">
                  <span className="text-sm font-medium">{g.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {clients.filter((c) => c.groupId === g.id).length} clientes
                    </span>
                    <button onClick={() => removeGroup(g.id)} className="text-rose-400">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </motion.div>
  )
}
