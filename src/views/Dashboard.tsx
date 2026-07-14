import { useState } from 'react'
import { useStore } from '@/store/useStore'
import QuickSale from '@/components/orders/QuickSale'
import { Zap } from 'lucide-react'
import { formatCurrency, formatDate, formatShortDate, today, isoWeekStart } from '@/lib/format'
import { orderTotal } from '@/lib/receipt'
import { dueState, dueLabel, dueBadgeClass } from '@/lib/delivery'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users, Receipt, BarChart2, ChevronRight, Truck, HandCoins, PackageOpen } from 'lucide-react'
import { isLowStock, totalStock } from '@/lib/stock'
import { canUseSocialMedia } from '@/lib/plan'
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
import ShareCard from '@/components/marketing/ShareCard'
import type { ReactNode } from 'react'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  ready: 'Listo',
  completed: 'Entregado',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  ready: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

function KPICard({ icon, iconBg, label, value, valueClass = 'text-ink' }: {
  icon: ReactNode; iconBg: string; label: string; value: string; valueClass?: string
}) {
  return (
    <div className="bg-surface rounded-2xl p-3 shadow-sm">
      <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center mb-2`}>{icon}</div>
      <p className="text-[11px] text-ink-soft">{label}</p>
      <p className={`text-sm font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  )
}

function NavCard({ onClick, icon, bg, count, label }: {
  onClick: () => void; icon: ReactNode; bg: string; count: number; label: string
}) {
  return (
    <button
      onClick={onClick}
      className="bg-surface rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.97] transition-transform text-left"
    >
      <span className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</span>
      <div>
        <p className="text-xl font-bold text-ink">{count}</p>
        <p className="text-xs text-ink-soft">{label}</p>
      </div>
    </button>
  )
}

export default function Dashboard() {
  const { orders, expenses, products, customers, user, setView } = useStore()
  const [showQuickSale, setShowQuickSale] = useState(false)

  const thisMonth = today().slice(0, 7)
  const monthlySales = orders
    .filter(o => o.status === 'completed' && o.date.startsWith(thisMonth))
    .reduce((s, o) => s + orderTotal(o), 0)
  const monthlyExpenses = expenses
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((s, e) => s + e.amount, 0)
  const profit = monthlySales - monthlyExpenses
  const activeOrders = orders.filter(o => o.status !== 'completed')
  const recent = orders.slice(0, 5)

  const deliveriesToday = orders.filter(o => o.dueDate === today() && o.status !== 'completed')
  const totalDebt = orders.filter(o => o.paid === false).reduce((s, o) => s + orderTotal(o), 0)
  const lowStock = products.filter(isLowStock)

  // Ventas completadas por semana, últimas 6 semanas
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (5 - i) * 7)
    return isoWeekStart(d)
  })
  const weeklySales = weeks.map(ws => ({
    week: formatShortDate(ws),
    total: orders
      .filter(o => o.status === 'completed' && isoWeekStart(new Date(o.date + 'T12:00:00')) === ws)
      .reduce((s, o) => s + orderTotal(o), 0),
  }))
  const hasChartData = weeklySales.some(w => w.total > 0)

  return (
    <div className="p-4 space-y-5 pb-24">
      <section>
        <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">Este mes</h2>
        <div className="grid grid-cols-3 gap-2">
          <KPICard icon={<TrendingUp size={16} className="text-brand-600" />} iconBg="bg-brand-600/10" label="Ventas" value={formatCurrency(monthlySales)} />
          <KPICard icon={<TrendingDown size={16} className="text-red-500" />} iconBg="bg-red-500/10" label="Gastos" value={formatCurrency(monthlyExpenses)} />
          <KPICard
            icon={<DollarSign size={16} className={profit >= 0 ? 'text-brand-600' : 'text-red-500'} />}
            iconBg={profit >= 0 ? 'bg-brand-600/10' : 'bg-red-500/10'}
            label="Ganancia"
            value={formatCurrency(profit)}
            valueClass={profit >= 0 ? 'text-brand-600' : 'text-red-500'}
          />
        </div>
      </section>

      {deliveriesToday.length > 0 && (
        <button
          onClick={() => setView('orders')}
          className="w-full flex items-center gap-3 bg-amber-100 dark:bg-amber-500/15 rounded-2xl p-3.5 text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Truck size={17} color="white" />
          </span>
          <p className="flex-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
            Hoy entregás {deliveriesToday.length} pedido{deliveriesToday.length !== 1 ? 's' : ''}
          </p>
          <ChevronRight size={16} className="text-amber-700 dark:text-amber-300 shrink-0" />
        </button>
      )}

      {totalDebt > 0 && (
        <button
          onClick={() => setView('customers')}
          className="w-full flex items-center gap-3 bg-rose-100 dark:bg-rose-500/15 rounded-2xl p-3.5 text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
            <HandCoins size={17} color="white" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Por cobrar: {formatCurrency(totalDebt)}</p>
            <p className="text-xs text-rose-700/70 dark:text-rose-300/70">Tocá para ver quién te debe</p>
          </div>
          <ChevronRight size={16} className="text-rose-700 dark:text-rose-300 shrink-0" />
        </button>
      )}

      {lowStock.length > 0 && (
        <button
          onClick={() => setView('products')}
          className="w-full flex items-center gap-3 bg-orange-100 dark:bg-orange-500/15 rounded-2xl p-3.5 text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
            <PackageOpen size={17} color="white" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              {lowStock.length} producto{lowStock.length !== 1 ? 's' : ''} por agotarse
            </p>
            <p className="text-xs text-orange-700/70 dark:text-orange-300/70 truncate">
              {lowStock.slice(0, 3).map(p => `${p.name} (${totalStock(p)})`).join(', ')}
            </p>
          </div>
          <ChevronRight size={16} className="text-orange-700 dark:text-orange-300 shrink-0" />
        </button>
      )}

      <button
        onClick={() => setShowQuickSale(true)}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white rounded-2xl py-3.5 font-bold text-sm shadow-sm active:scale-[0.98] transition-transform"
      >
        <Zap size={17} /> Venta rápida
      </button>

      <section className="grid grid-cols-2 gap-3">
        <NavCard onClick={() => setView('orders')} icon={<ShoppingBag size={18} color="white" />} bg="bg-brand-600" count={activeOrders.length} label="Pedidos activos" />
        <NavCard onClick={() => setView('products')} icon={<Package size={18} color="white" />} bg="bg-azure-600" count={products.length} label="Productos" />
        <NavCard onClick={() => setView('customers')} icon={<Users size={18} color="white" />} bg="bg-purple-500" count={customers.length} label="Clientes" />
        <NavCard onClick={() => setView('expenses')} icon={<Receipt size={18} color="white" />} bg="bg-red-500" count={expenses.filter(e => e.date.startsWith(thisMonth)).length} label="Gastos del mes" />
      </section>

      {hasChartData && (
        <section className="bg-surface rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">Ventas por semana</h2>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklySales} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink-soft)' }} />
              <Bar dataKey="total" fill="var(--color-brand-600)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      <button
        onClick={() => setView('social')}
        className="w-full bg-surface rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left"
      >
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
          <BarChart2 size={18} color="white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink text-sm">Redes Sociales</p>
          <p className="text-xs text-ink-soft">Métricas semanales de Instagram, TikTok y Facebook</p>
        </div>
        {!canUseSocialMedia(user?.plan ?? 'free') && (
          <span className="text-[10px] font-bold text-brand-600 bg-brand-600/10 px-2 py-1 rounded-full shrink-0">PRO</span>
        )}
        <ChevronRight size={16} className="text-ink-soft shrink-0" />
      </button>

      {recent.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">Pedidos recientes</h2>
            <button onClick={() => setView('orders')} className="text-xs text-brand-600 font-medium">Ver todos</button>
          </div>
          <div className="space-y-2">
            {recent.map(order => {
              const ds = dueState(order.dueDate)
              return (
                <button
                  key={order.id}
                  onClick={() => setView('orders')}
                  className="w-full bg-surface rounded-2xl p-3 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm truncate">{order.customerName || 'Sin nombre'}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-ink-soft">{formatDate(order.date)}</p>
                      {order.dueDate && ds !== 'none' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${dueBadgeClass(ds)}`}>
                          {dueLabel(order.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-semibold text-sm text-ink">{formatCurrency(orderTotal(order))}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-4">
            <ShareCard />
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-brand-600/10 flex items-center justify-center">
            <ShoppingBag size={24} className="text-brand-600" />
          </span>
          <p className="font-semibold text-ink">¡Bienvenido a Brota!</p>
          <p className="text-ink-soft text-sm">Empezá registrando tu primer pedido o producto.</p>
          <button onClick={() => setView('orders')} className="mt-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
            Nuevo pedido
          </button>
        </div>
      )}

      <QuickSale open={showQuickSale} onClose={() => setShowQuickSale(false)} />
    </div>
  )
}
