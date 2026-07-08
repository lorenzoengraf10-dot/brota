import { useStore } from '@/store/useStore'
import { formatCurrency, formatDate, today } from '@/lib/format'
import { orderTotal } from '@/lib/receipt'
import { dueState, dueLabel, dueBadgeClass } from '@/lib/delivery'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users, Receipt, BarChart2, ChevronRight } from 'lucide-react'
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

      <section className="grid grid-cols-2 gap-3">
        <NavCard onClick={() => setView('orders')} icon={<ShoppingBag size={18} color="white" />} bg="bg-brand-600" count={activeOrders.length} label="Pedidos activos" />
        <NavCard onClick={() => setView('products')} icon={<Package size={18} color="white" />} bg="bg-azure-600" count={products.length} label="Productos" />
        <NavCard onClick={() => setView('customers')} icon={<Users size={18} color="white" />} bg="bg-purple-500" count={customers.length} label="Clientes" />
        <NavCard onClick={() => setView('expenses')} icon={<Receipt size={18} color="white" />} bg="bg-red-500" count={expenses.filter(e => e.date.startsWith(thisMonth)).length} label="Gastos del mes" />
      </section>

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
        {user?.plan !== 'pro' && (
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
    </div>
  )
}
