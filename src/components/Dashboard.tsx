import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Users, Package, ShoppingCart } from 'lucide-react'
import { useSalesStore } from '@/store/useSalesStore'
import { useExpensesStore } from '@/store/useExpensesStore'
import { useProductsStore } from '@/store/useProductsStore'
import { useClientsStore } from '@/store/useClientsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-[#e5e0d5] flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { sales, fetch: fetchSales } = useSalesStore()
  const { expenses, fetch: fetchExpenses } = useExpensesStore()
  const { products, fetch: fetchProducts } = useProductsStore()
  const { clients, fetch: fetchClients } = useClientsStore()

  useEffect(() => {
    if (!user) return
    fetchSales(user.id)
    fetchExpenses(user.id)
    fetchProducts(user.id)
    fetchClients(user.id)
  }, [user])

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlySales = useMemo(() =>
    sales.filter((s) => s.createdAt.startsWith(thisMonth) && s.status === 'pagado')
      .reduce((acc, s) => acc + s.total, 0), [sales, thisMonth])

  const monthlyExpenses = useMemo(() =>
    expenses.filter((e) => e.date.startsWith(thisMonth))
      .reduce((acc, e) => acc + e.amount, 0), [expenses, thisMonth])

  const profit = monthlySales - monthlyExpenses

  const chartData = useMemo(() => {
    const last6: { name: string; ventas: number; gastos: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('es-AR', { month: 'short' })
      const ventas = sales.filter((s) => s.createdAt.startsWith(key) && s.status === 'pagado').reduce((a, s) => a + s.total, 0)
      const gastos = expenses.filter((e) => e.date.startsWith(key)).reduce((a, e) => a + e.amount, 0)
      last6.push({ name: label, ventas, gastos })
    }
    return last6
  }, [sales, expenses])

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4 pb-4"
    >
      <div>
        <h2 className="text-xl font-bold">Resumen del mes</h2>
        <p className="text-sm text-gray-400">{now.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ventas" value={fmt(monthlySales)} icon={DollarSign} color="bg-[#059669]" />
        <StatCard label="Gastos" value={fmt(monthlyExpenses)} icon={TrendingDown} color="bg-rose-500" />
        <StatCard label="Ganancia neta" value={fmt(profit)} icon={profit >= 0 ? TrendingUp : TrendingDown} color={profit >= 0 ? 'bg-emerald-600' : 'bg-rose-500'} />
        <StatCard label="Ventas hoy" value={fmt(sales.filter((s) => s.createdAt.startsWith(now.toISOString().slice(0, 10)) && s.status === 'pagado').reduce((a, s) => a + s.total, 0))} icon={ShoppingCart} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Clientes" value={String(clients.length)} icon={Users} color="bg-violet-500" />
        <StatCard label="Productos" value={String(products.filter((p) => p.active).length)} icon={Package} color="bg-amber-500" />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#e5e0d5]">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Ventas vs Gastos (6 meses)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={12}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="ventas" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {sales.slice(0, 5).length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#e5e0d5]">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Últimas ventas</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.clientName ?? 'Cliente ocasional'}</p>
                  <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                <span className={`text-sm font-semibold ${
                  s.status === 'pagado' ? 'text-[#059669]' : s.status === 'pendiente' ? 'text-amber-500' : 'text-gray-400'
                }`}>{fmt(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
