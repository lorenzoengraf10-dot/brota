# Brota

Gestión simple para emprendedores argentinos. Registrá ventas, productos, clientes y gastos desde el celular.

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS v4
- Zustand (estado global)
- Supabase (DB + Auth con RLS)
- Radix UI + Framer Motion
- PWA (vite-plugin-pwa + Workbox)
- Electron (escritorio Windows)

## Setup local

```bash
npm install
cp .env.example .env       # completar con tus keys de Supabase y GA
npm run dev
```

## Base de datos

Ejecutar `src/lib/supabase-schema.sql` en el SQL Editor de tu proyecto Supabase.

## Deploy

El deploy se hace automáticamente a **Cloudflare Workers** cuando se hace push a `main`.

Configurá estos secrets en GitHub → Settings → Secrets:

| Secret | Dónde obtenerlo |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams |
| `CF_API_TOKEN` | Cloudflare → My Profile → API Tokens |
| `CF_ACCOUNT_ID` | Cloudflare → Overview (barra lateral) |

## Dominio

Dominio: `brotaonline.com` (comprar en Hostinger, apuntar nameservers a Cloudflare).

## Legal

- Política de Privacidad: cumple Ley 25.326
- Términos y Condiciones: accesibles desde la Landing
- Consentimiento de cookies para Google Analytics
