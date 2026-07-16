// Modo demo: previsualizar la interfaz sin configurar Supabase.
// Se activa con VITE_DEMO_MODE=true en .env (ver .env.example).
// Nunca se activa en producción salvo que alguien lo prenda a propósito.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
