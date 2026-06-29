-- ============================================================
-- ADDENDUM 1: tabla para planes de usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS user_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own plan" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Para ACTIVAR Pro:
-- INSERT INTO user_plans (user_id, plan, activated_at)
-- VALUES ('<uuid>', 'pro', now())
-- ON CONFLICT (user_id) DO UPDATE
--   SET plan = 'pro', activated_at = now(), updated_at = now();
--
-- Para volver a free:
-- UPDATE user_plans SET plan = 'free', updated_at = now() WHERE user_id = '<uuid>';
-- El UUID del usuario está en Supabase → Authentication → Users

-- ============================================================
-- ADDENDUM 2: columnas para pedidos y descuentos en la tabla sales
-- ============================================================
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS discount_type TEXT,      -- 'percentage' | 'fixed'
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS order_status TEXT,       -- 'pendiente' | 'listo' | 'completado'
  ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- Índice para consultas por estado de pedido
CREATE INDEX IF NOT EXISTS idx_sales_order_status ON sales(user_id, order_status);
