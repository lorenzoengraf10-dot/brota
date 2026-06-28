import { useState } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const { notifications, markNotificationRead, clearNotifications } = useAppStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-[#f6f2e8] transition-colors">
        <Bell size={20} className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#059669] rounded-full text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            className="absolute right-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-xl border border-[#e5e0d5] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-[#e5e0d5]">
              <span className="text-sm font-semibold">Notificaciones</span>
              {notifications.length > 0 && (
                <button onClick={clearNotifications} className="text-xs text-gray-400 hover:text-red-400">Limpiar</button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-6">Sin notificaciones</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`w-full text-left px-4 py-3 border-b border-[#f6f2e8] last:border-0 hover:bg-[#f6f2e8] transition-colors ${
                      !n.read ? 'bg-green-50' : ''
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
