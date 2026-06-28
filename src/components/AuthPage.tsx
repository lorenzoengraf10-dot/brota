import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        if (!businessName.trim()) { setError('Ingresá el nombre de tu negocio'); setLoading(false); return }
        await signUp(email, password, businessName)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-[#f6f2e8] px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#059669] rounded-2xl mb-3">
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
              <path d="M32 10 C18 10 12 22 14 34 C16 46 26 54 32 56 C38 54 48 46 50 34 C52 22 46 10 32 10Z" fill="#f6f2e8" opacity="0.9"/>
              <path d="M32 26 L32 54 M22 36 C22 36 27 31 32 33 C37 35 42 31 42 31" stroke="#059669" strokeWidth="3" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#059669]">Brota</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión para tu emprendimiento</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e0d5]">
          <div className="flex rounded-xl bg-[#f6f2e8] p-1 mb-5">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m ? 'bg-white shadow text-[#059669]' : 'text-gray-500'
                }`}
              >
                {m === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre de tu negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#e5e0d5] text-sm focus:outline-none focus:border-[#059669]"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#e5e0d5] text-sm focus:outline-none focus:border-[#059669]"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-10 py-3 rounded-xl border border-[#e5e0d5] text-sm focus:outline-none focus:border-[#059669]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#059669] text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-opacity"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
