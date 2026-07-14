// Aplica el tema oscuro antes del primer paint (evita flash).
// Externo (no inline) para que la CSP pueda prohibir scripts inline.
try {
  var s = JSON.parse(localStorage.getItem('brota-v2') || '{}')
  var dm = (s.state && s.state.darkMode) || 'system'
  if (dm === 'dark' || (dm === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
} catch (e) {}
