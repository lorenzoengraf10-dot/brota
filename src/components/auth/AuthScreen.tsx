import { useState } from 'react'
import { Sprout } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/useStore'

export default function AuthScreen() {
  const { setView } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMagicLink = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  const handlePassword = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInErr) {
      const { error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (signUpErr) setError(signUpErr.message)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-cream px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">Revisá tu email</h1>
        <p className="text-ink-soft text-sm max-w-xs">
          Te enviamos un link mágico a <strong>{email}</strong>. Tapá el link para entrar.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-brand-600 font-medium"
        >
          Usar otro email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4">
          <Sprout size={28} color="white" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-ink mb-1">Bienvenido/a</h1>
        <p className="text-ink-soft text-sm mb-8 text-center">Ingresá con tu email para continuar</p>

        <div className="w-full max-w-sm space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-soft block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (mode === 'magic' ? handleMagicLink() : handlePassword())}
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-surface text-ink text-sm focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>

          {mode === 'password' && (
            <div>
              <label className="text-xs font-medium text-ink-soft block mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePassword()}
                placeholder="Mínimo 6 caracteres"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl border border-black/10 bg-surface text-ink text-sm focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            onClick={mode === 'magic' ? handleMagicLink : handlePassword}
            disabled={loading || !email.trim()}
            className="w-full py-3 bg-brand-600 text-white font-semibold rounded-2xl text-sm disabled:opacity-50 transition-opacity"
          >
            {loading
              ? 'Cargando...'
              : mode === 'magic'
              ? 'Recibir link mágico'
              : 'Entrar / Registrarme'}
          </button>

          <button
            onClick={() => { setMode(mode === 'magic' ? 'password' : 'magic'); setError('') }}
            className="w-full py-2 text-sm text-ink-soft"
          >
            {mode === 'magic' ? 'Prefiero usar contraseña →' : '← Usar link mágico'}
          </button>
        </div>
      </div>

      <div className="text-center pb-8 px-6">
        <p className="text-xs text-ink-soft">
          Al entrar aceptás los{' '}
          <button onClick={() => setView('terms')} className="underline">Términos</button>
          {' '}y la{' '}
          <button onClick={() => setView('privacy')} className="underline">Privacidad</button>
        </p>
      </div>
    </div>
  )
}
