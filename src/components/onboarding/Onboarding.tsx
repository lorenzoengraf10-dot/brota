import { useState } from 'react'
import { Sprout, ArrowRight, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

const CURRENCIES = [
  { value: 'ARS', label: 'Peso argentino', symbol: '$' },
  { value: 'USD', label: 'Dólar estadounidense', symbol: 'US$' },
]

export default function Onboarding() {
  const { business, completeOnboarding, setView } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [saving, setSaving] = useState(false)

  const finish = async () => {
    if (!business) return
    setSaving(true)
    await supabase
      .from('businesses')
      .update({ name: name.trim() || 'Mi emprendimiento', currency })
      .eq('id', business.id)
    completeOnboarding()
    setView('dashboard')
  }

  const steps = [
    {
      title: '¿Cómo se llama tu emprendimiento?',
      subtitle: 'Pods cambiarlo más adelante desde Configuración.',
      content: (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && step === 0 && setStep(1)}
          placeholder="Ej: Tortas de Sofi"
          maxLength={60}
          autoFocus
          className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-white text-ink text-base focus:outline-none focus:border-brand-600"
        />
      ),
    },
    {
      title: '¿Con qué moneda trabás?',
      subtitle: 'Todas las ventas y gastos se mostrarán en esta moneda.',
      content: (
        <div className="space-y-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCurrency(c.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-colors ${
                currency === c.value
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-black/10 bg-white'
              }`}
            >
              <span className="text-sm font-medium text-ink">{c.label}</span>
              <span className="text-sm text-ink-soft font-mono">{c.symbol}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: '¡Todo listo!',
      subtitle: `${name.trim() || 'Tu emprendimiento'} ya está configurado. Podés empezar a registrar ventas, productos y clientes.`,
      content: (
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
            <Check size={40} className="text-brand-600" strokeWidth={2.5} />
          </div>
        </div>
      ),
    },
  ]

  const current = steps[step]

  return (
    <div className="flex flex-col h-full bg-cream px-6 py-12">
      <div className="flex items-center gap-2 mb-12">
        <span className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
          <Sprout size={16} color="white" strokeWidth={2.5} />
        </span>
        <span className="font-bold text-ink text-lg">Brota</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-brand-600' : 'bg-black/10'
            }`}
          />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-ink mb-2">{current.title}</h2>
      <p className="text-ink-soft text-sm mb-8">{current.subtitle}</p>

      <div className="mb-auto">{current.content}</div>

      <div className="mt-8">
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2"
          >
            Continuar <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-2xl disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Empezar a usar Brota 🌱'}
          </button>
        )}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 py-2 text-sm text-ink-soft"
          >
            Volver
          </button>
        )}
      </div>
    </div>
  )
}
