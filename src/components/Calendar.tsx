import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSalesStore } from '@/store/useSalesStore'
import { useExpensesStore } from '@/store/useExpensesStore'
import { useAuthStore } from '@/store/useAuthStore'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)

export default function Calendar() {
  const { user } = useAuthStore()
  const { sales, fetch: fetchSales } = useSalesStore()
  const { expenses, fetch: fetchExpenses } = useExpensesStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchSales(user.id)
    fetchExpenses(user.id)
  }, [user])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Start week on Monday
  const firstDayRaw = new Date(year, month, 1).getDay()
  const startOffset = (firstDayRaw + 6) % 7

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const today = new Date().toISOString().slice(0, 10)

  const salesByDay = useMemo(() => {
    const map: Record<string, number> = {}
    sales
      .filter((s) => s.createdAt.startsWith(monthKey) && s.status === 'pagado')
      .forEach((s) => {
        const day = s.createdAt.slice(0, 10)
        map[day] = (map[day] ?? 0) + s.total
      })
    return map
  }, [sales, monthKey])

  const expensesByDay = useMemo(() => {
    const map: Record<string, number> = {}
    expenses
      .filter((e) => e.date.startsWith(monthKey))
      .forEach((e) => {
        map[e.date] = (map[e.date] ?? 0) + e.amount
      })
    return map
  }, [expenses, monthKey])

  const totalSales = Object.values(salesByDay).reduce((a, v) => a + v, 0)
  const totalExpenses = Object.values(expensesByDay).reduce((a, v) => a + v, 0)

  const selectedSales = selectedDay
    ? sales.filter((s) => s.createdAt.startsWith(selectedDay) && s.status === 'pagado')
    : []
  const selectedExpenses = selectedDay
    ? expenses.filter((e) => e.date === selectedDay)
    : []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-4 space-y-4">
      {/* Header navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 rounded-xl hover:bg-[#f6f2e8] transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold capitalize">
          {currentDate.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 rounded-xl hover:bg-[#f6f2e8] transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#059669]/10 rounded-2xl p-3">
          <p className="text-xs text-[#059669] font-medium">Ventas del mes</p>
          <p className="text-lg font-bold text-[#059669] mt-0.5">{fmt(totalSales)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{Object.keys(salesByDay).length} días con ventas</p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-3">
          <p className="text-xs text-rose-500 font-medium">Gastos del mes</p>
          <p className="text-lg font-bold text-rose-500 mt-0.5">{fmt(totalExpenses)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{Object.keys(expensesByDay).length} días con gastos</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-[#e5e0d5] p-3">
        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`
            const hasSales = !!salesByDay[dateKey]
            const hasExpenses = !!expensesByDay[dateKey]
            const isToday = dateKey === today
            const isSelected = dateKey === selectedDay

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#059669] text-white'
                    : isToday
                    ? 'bg-[#059669]/10 text-[#059669] font-bold'
                    : 'hover:bg-[#f6f2e8] text-gray-700'
                }`}
              >
                <span className="leading-none">{day}</span>
                {(hasSales || hasExpenses) && (
                  <div className="flex gap-0.5 mt-1">
                    {hasSales && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white/80' : 'bg-[#059669]'
                        }`}
                      />
                    )}
                    {hasExpenses && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-rose-200' : 'bg-rose-400'
                        }`}
                      />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-gray-400 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#059669]" /> Ventas cobradas
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-400" /> Gastos
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#e5e0d5] p-4 space-y-3"
        >
          <h3 className="font-semibold text-sm capitalize">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>

          {selectedSales.length === 0 && selectedExpenses.length === 0 && (
            <p className="text-sm text-gray-400">Sin movimientos ese día</p>
          )}

          {selectedSales.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wide mb-2">Ventas</p>
              {selectedSales.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between text-sm py-1.5 border-b border-[#f6f2e8] last:border-0"
                >
                  <span className="text-gray-600">{s.clientName ?? 'Cliente ocasional'}</span>
                  <span className="font-semibold text-[#059669]">{fmt(s.total)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 font-bold">
                <span>Total ventas</span>
                <span className="text-[#059669]">{fmt(selectedSales.reduce((a, s) => a + s.total, 0))}</span>
              </div>
            </div>
          )}

          {selectedExpenses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-2">Gastos</p>
              {selectedExpenses.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between text-sm py-1.5 border-b border-[#f6f2e8] last:border-0"
                >
                  <span className="text-gray-600">{e.description}</span>
                  <span className="font-semibold text-rose-500">{fmt(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
