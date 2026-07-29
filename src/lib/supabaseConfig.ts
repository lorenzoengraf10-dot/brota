// La anon key es pública por diseño (RLS protege los datos), pero se lee de
// env para que los secrets de CI (VITE_SUPABASE_*) sean efectivos; el valor
// hardcodeado queda solo como fallback para desarrollo local sin .env.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://suhrhfctcldloaeioazh.supabase.co'
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHJoZmN0Y2xkbG9hZWlvYXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDY1MjYsImV4cCI6MjEwMDkyMjUyNn0.CD9Dg0XlWyXG0eGpXLJmGCrWUJ0XuOHJzeHR19LpW9c'

export const isCloudEnabled = true
