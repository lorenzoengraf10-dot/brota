-- Brota — Schema v2: fiado, catálogo público y multi-emprendimiento
-- Ejecutar en el SQL Editor de Supabase DESPUÉS del schema base.

-- ===========================================================
-- 1. FIADO: pedidos con pago pendiente
-- ===========================================================
alter table orders
  add column if not exists paid boolean not null default true;

create index if not exists idx_orders_unpaid on orders(business_id) where paid = false;

-- ===========================================================
-- 2. CATÁLOGO PÚBLICO: slug + WhatsApp del negocio
-- ===========================================================
alter table businesses
  add column if not exists slug text unique,
  add column if not exists whatsapp text not null default '';

-- Vistas públicas para el catálogo (brotaonline.com/tienda/<slug>).
-- Exponen SOLO columnas públicas: nunca cost_price, clientes ni ventas.
-- security_invoker=off (default): la vista lee con permisos del dueño de
-- la vista y saltea el RLS de la tabla, por eso el grant a anon es seguro
-- únicamente sobre estas columnas.
create or replace view catalog_businesses as
  select id, name, slug, whatsapp, currency
  from businesses
  where slug is not null;

create or replace view catalog_products as
  select p.id, p.business_id, p.name, p.sale_price, p.stock
  from products p
  join businesses b on b.id = p.business_id
  where b.slug is not null;

grant select on catalog_businesses to anon, authenticated;
grant select on catalog_products to anon, authenticated;

-- ===========================================================
-- 3. MULTI-EMPRENDIMIENTO
-- ===========================================================
-- No requiere cambios: businesses ya soporta N filas por user_id y
-- las policies "owner" cubren todas. El límite (free = 1, pro = ∞)
-- se aplica en el cliente; para reforzarlo en servidor:
--
-- create or replace function check_business_limit()
-- returns trigger as $$
-- begin
--   if (select count(*) from businesses where user_id = new.user_id) >= 1
--      and coalesce((select plan from user_plans where user_id = new.user_id), 'free') = 'free' then
--     raise exception 'Plan gratuito: máximo 1 emprendimiento';
--   end if;
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger business_limit before insert on businesses
--   for each row execute function check_business_limit();
