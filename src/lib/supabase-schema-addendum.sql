-- Agregar tabla para planes de usuario
-- Ejecutar en Supabase SQL Editor (complemento al schema principal)

CREATE TABLE IF NOT EXISTS user_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden LEER su propio plan.
-- El admin activa Pro directamente desde el dashboard de Supabase.
CREATE POLICY "Users read own plan" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Para ACTIVAR el plan Pro de un usuario desde Supabase:
-- ============================================================
-- INSERT INTO user_plans (user_id, plan, activated_at)
-- VALUES ('<pegar-uuid-del-usuario>', 'pro', now())
-- ON CONFLICT (user_id) DO UPDATE
--   SET plan = 'pro', activated_at = now(), updated_at = now();
--
-- Para DESACTIVAR (volver a free):
-- UPDATE user_plans SET plan = 'free', updated_at = now()
-- WHERE user_id = '<uuid>';
-- ============================================================
-- El UUID del usuario se ve en Supabase → Authentication → Users
-- ============================================================
