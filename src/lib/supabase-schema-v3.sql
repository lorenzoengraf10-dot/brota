-- Brota — Schema v3: beta gratis de lanzamiento, variantes, mini-sitio
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de v1 y v2.
-- Todas las secciones son aditivas: no rompen datos existentes.
-- IMPORTANTE: aplicar cada sección ANTES de deployar el front que la usa.

-- ===========================================================
-- 1. BETA GRATIS DE LANZAMIENTO
-- ===========================================================
-- Se pausan los límites del plan gratuito SIN borrar la función ni los
-- triggers. El plan gratuito es para siempre; cuando se lance Premium,
-- re-habilitar con:
--   alter table businesses enable trigger free_limit_businesses;
--   alter table products   enable trigger free_limit_products;
--   alter table customers  enable trigger free_limit_customers;
--   alter table orders     enable trigger free_limit_orders;
--   alter table expenses   enable trigger free_limit_expenses;
-- y poner LAUNCH_FREE = false en src/lib/plan.ts.
alter table businesses disable trigger free_limit_businesses;
alter table products   disable trigger free_limit_products;
alter table customers  disable trigger free_limit_customers;
alter table orders     disable trigger free_limit_orders;
alter table expenses   disable trigger free_limit_expenses;

-- Usuarios fundadores: quienes se suman durante la beta tendrán un
-- beneficio especial cuando llegue Premium.
alter table user_plans
  add column if not exists is_founder boolean not null default false,
  add column if not exists founder_since timestamptz;

-- Todos los usuarios existentes son fundadores
insert into user_plans (user_id, plan, is_founder, founder_since)
select id, 'free', true, now() from auth.users
on conflict (user_id) do update
  set is_founder = true,
      founder_since = coalesce(user_plans.founder_since, now());

-- Los registros nuevos durante la beta también son fundadores.
-- Al lanzar Premium: drop trigger on_auth_user_created_founder on auth.users;
create or replace function public.handle_new_user_founder()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into user_plans (user_id, plan, is_founder, founder_since)
  values (new.id, 'free', true, now())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_founder on auth.users;
create trigger on_auth_user_created_founder
  after insert on auth.users
  for each row execute function handle_new_user_founder();

-- ===========================================================
-- 2. VARIANTES DE PRODUCTO + ALERTA DE STOCK BAJO
-- ===========================================================
-- Variantes embebidas como JSONB (claves en camelCase, las escribe la app):
-- [{ "id", "name", "salePrice", "costPrice", "stock" }]
-- null = producto sin variantes. Se elige JSONB (no tabla aparte) para que
-- el sync offline siga siendo un upsert por producto.
alter table products
  add column if not exists variants jsonb,
  add column if not exists low_stock_threshold integer;

-- El catálogo público ahora expone variantes (cambia la firma → drop primero)
drop function if exists public.catalog_products(text);
create or replace function public.catalog_products(p_slug text)
returns table (id uuid, name text, sale_price numeric, stock integer, image_url text, variants jsonb)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.sale_price, p.stock, p.image_url, p.variants
  from products p
  join businesses b on b.id = p.business_id
  where b.slug = p_slug
  order by p.name;
$$;

grant execute on function public.catalog_products(text) to anon, authenticated;

-- ===========================================================
-- 3. MINI-SITIO PÚBLICO (datos del negocio en el catálogo)
-- ===========================================================
alter table businesses
  add column if not exists description text not null default '',
  add column if not exists logo_url text,
  add column if not exists hours_text text not null default '',
  add column if not exists instagram text not null default '',
  add column if not exists tiktok text not null default '',
  add column if not exists address text not null default '';

-- El RPC del catálogo expone los campos nuevos (cambia la firma → drop)
drop function if exists public.catalog_business(text);
create or replace function public.catalog_business(p_slug text)
returns table (
  id uuid, name text, slug text, whatsapp text, currency text,
  description text, logo_url text, hours_text text,
  instagram text, tiktok text, address text
)
language sql stable security definer set search_path = public
as $$
  select id, name, slug, whatsapp, currency,
         description, logo_url, hours_text, instagram, tiktok, address
  from businesses
  where slug = p_slug;
$$;

grant execute on function public.catalog_business(text) to anon, authenticated;
