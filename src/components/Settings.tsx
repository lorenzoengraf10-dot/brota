import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, LogOut, Trash2, Shield, FileText, MessageCircle, Crown, ChevronRight, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { useSalesStore } from '@/store/useSalesStore'
import { useExpensesStore } from '@/store/useExpensesStore'
import { useProductsStore } from '@/store/useProductsStore'
import { useClientsStore } from '@/store/useClientsStore'
import { exportSales, exportExpenses, exportProducts, exportClients } from '@/lib/export'
import { waDeleteLink, waSupportLink, FREE_LIMITS } from '@/lib/plans'
import UpgradeModal from './UpgradeModal'

export default function Settings() {
  const { user, signOut, refreshPlan } = useAuthStore()
  const { setView, resetCookieConsent, addNotification } = useAppStore()
  const { sales } = useSalesStore()
  const { expenses } = useExpensesStore()
  const { products } = useProductsStore()
  const { clients } = useClientsStore()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const isPro = user?.plan === 'pro'

  const thisMonth = new Date().toISOString().slice(0, 7)
  const salesThisMonth = sales.filter((s) => s.createdAt.startsWith(thisMonth)).length

  const handleRefreshPlan = async () => {
    setRefreshing(true)
    await refreshPlan()
    setRefreshing(false)
    addNotification({
      title: 'Plan verificado',
      message: `Plan actual: ${user?.plan === 'pro' ? 'Pro ✨' : 'Gratuito'}`,
      type: 'info',
    })
  }

  const planUsage = [
    { label: 'Productos', used: products.length, max: FREE_LIMITS.products },
    { label: 'Clientes', used: clients.length, max: FREE_LIMITS.clients },
    { label: 'Ventas este mes', used: salesThisMonth, max: FREE_LIMITS.salesPerMonth },
  ]

  const exports = [
    {
      label: 'Ventas',
      count: sales.length,
      fn: () => {
        exportSales(sales)
        addNotification({ title: 'Exportado', message: `${sales.length} ventas`, type: 'success' })
      },
    },
    {
      label: 'Gastos',
      count: expenses.length,
      fn: () => {
        exportExpenses(expenses)
        addNotification({ title: 'Exportado', message: `${expenses.length} gastos`, type: 'success' })
      },
    },
    {
      label: 'Productos',
      count: products.length,
      fn: () => {
        exportProducts(products)
        addNotification({ title: 'Exportado', message: `${products.length} productos`, type: 'success' })
      },
    },
    {
      label: 'Clientes',
      count: clients.length,
      fn: () => {
        exportClients(clients)
        addNotification({ title: 'Exportado', message: `${clients.length} clientes`, type: 'success' })
      },
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-24 space-y-5">
      <h2 className="text-xl font-bold">Configuración</h2>

      {/* Plan */}
      <div
        className={`rounded-2xl p-4 border ${
          isPro ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white border-[#e5e0d5]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown size={18} className={isPro ? 'text-yellow-300' : 'text-amber-400'} />
            <span className="font-bold text-base">{isPro ? 'Plan Pro ✨' : 'Plan Gratuito'}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <button
                onClick={handleRefreshPlan}
                disabled={refreshing}
                title="Verificar plan"
                className="p-1.5 rounded-full hover:bg-[#f6f2e8] transition-colors"
              >
                <RefreshCw
                  size={14}
                  className={`text-gray-400 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
            )}
            {!isPro && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="px-3 py-1.5 bg-[#059669] text-white text-xs font-semibold rounded-full"
              >
                Mejorar →
              </button>
            )}
          </div>
        </div>

        {isPro ? (
          <p className="text-sm opacity-90">
            Acceso ilimitado a todas las funciones. ¡Gracias por apoyar Brota!
          </p>
        ) : (
          <div className="space-y-2.5">
            {planUsage.map(({ label, used, max }) => {
              const pct = Math.min(100, (used / max) * 100)
              const atLimit = used >= max
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{label}</span>
                    <span className={atLimit ? 'text-rose-500 font-semibold' : ''}>
                      {used}/{max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#f6f2e8] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        atLimit ? 'bg-rose-400' : 'bg-[#059669]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-gray-400 pt-1">
              ¿Llegaste al límite?{' '}
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-[#059669] font-semibold"
              >
                Pasáte al Pro
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Exportar datos */}
      <div className="bg-white rounded-2xl border border-[#e5e0d5] overflow-hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
          Exportar datos
        </p>
        {exports.map(({ label, count, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#f6f2e8] last:border-0 hover:bg-[#f6f2e8] active:bg-[#f0ece0] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download size={16} className="text-[#059669]" />
              <span className="text-sm">Exportar {label.toLowerCase()} (.csv)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{count} registros</span>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Legal */}
      <div className="bg-white rounded-2xl border border-[#e5e0d5] overflow-hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
          Legal
        </p>
        <button
          onClick={() => setView('privacy')}
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#f6f2e8] hover:bg-[#f6f2e8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-gray-400" />
            <span className="text-sm">Política de Privacidad</span>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </button>
        <button
          onClick={() => setView('terms')}
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#f6f2e8] hover:bg-[#f6f2e8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-gray-400" />
            <span className="text-sm">Términos y Condiciones</span>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </button>
        <button
          onClick={() => {
            resetCookieConsent()
            addNotification({ title: 'Cookies', message: 'Podés volver a elegir tus preferencias', type: 'info' })
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#f6f2e8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-gray-400" />
            <span className="text-sm">Preferencias de cookies</span>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </button>
      </div>

      {/* Cuenta */}
      <div className="bg-white rounded-2xl border border-[#e5e0d5] overflow-hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
          Cuenta
        </p>
        <div className="px-4 py-3 border-b border-[#f6f2e8]">
          <p className="text-xs text-gray-400">Email</p>
          <p className="text-sm font-medium mt-0.5">{user?.email}</p>
        </div>
        <a
          href={waSupportLink(user?.email ?? '')}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#f6f2e8] hover:bg-[#f6f2e8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={16} className="text-[#25D366]" />
            <span className="text-sm">Contactar soporte</span>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </a>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#f6f2e8] hover:bg-[#f6f2e8] transition-colors"
        >
          <LogOut size={16} className="text-gray-400" />
          <span className="text-sm">Cerrar sesión</span>
        </button>
        <button
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true)
              return
            }
            window.open(waDeleteLink(user?.email ?? ''), '_blank')
            setConfirmDelete(false)
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={16} className="text-rose-400" />
          <span
            className={`text-sm ${
              confirmDelete ? 'text-rose-600 font-semibold' : 'text-rose-400'
            }`}
          >
            {confirmDelete ? 'Tocá de nuevo para confirmar' : 'Eliminar mi cuenta'}
          </span>
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 pb-2">Brota v0.1.0 · Hecho con 💚 en Argentina</p>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </motion.div>
  )
}
