// La anon key es pública por diseño (RLS protege los datos), pero se lee de
// env para que los secrets de CI (VITE_SUPABASE_*) sean efectivos; el valor
// hardcodeado queda solo como fallback para desarrollo local sin .env.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ruzkxdghfusxrwdyhgtc.supabase.co'
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1emt4ZGdoZnVzeHJ3ZHloZ3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzI2NzIsImV4cCI6MjA5NzMwODY3Mn0.nMWDjHTQKc5D0CpD-7XHx2R9ebpHoiBSS0I9XEMCZqk'

export const isCloudEnabled = true
