-- ===========================================================
-- Brota — Setup completo de Supabase (schema + v2 + v3 + v4)
-- Pegar TODO este archivo en el SQL Editor de Supabase y ejecutar
-- una sola vez, en un proyecto nuevo. Ya incluye los fixes de
-- seguridad (no filtra costPrice, límites en el bucket de fotos).
-- ===========================================================

-- Brota — Schema Supabase
-- Ejecutar en el SQL Editor de Supabase

-- ===========================================================
-- EXTENSIONES
-- ===========================================================
create extension if not exists "uuid-ossp";

-- ===========================================================
-- BUSINESSES
-- ===========================================================
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'ARS',
  created_at timestamptz default now()
);
alter table businesses enable row level security;
create policy "owner" on businesses for all using (auth.uid() = user_id);

-- ===========================================================
-- USER PLANS
-- ===========================================================
create table if not exists user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  activated_at timestamptz,
  updated_at timestamptz default now()
);
alter table user_plans enable row level security;
create policy "Users read own plan" on user_plans for select using (auth.uid() = user_id);

-- Para activar Pro:
-- insert into user_plans (user_id, plan, activated_at)
-- values ('<uuid>', 'pro', now())
-- on conflict (user_id) do update set plan='pro', activated_at=now(), updated_at=now();

-- ===========================================================
-- PRODUCTS
-- ===========================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  cost_price numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  stock integer,
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "owner" on products for all
  using (business_id in (select id from businesses where user_id = auth.uid()));

-- ===========================================================
-- CUSTOMER GROUPS
-- ===========================================================
create table if not exists customer_groups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  color text not null default '#059669',
  created_at timestamptz default now()
);
alter table customer_groups enable row level security;
create policy "owner" on customer_groups for all
  using (business_id in (select id from businesses where user_id = auth.uid()));

-- ===========================================================
-- CUSTOMERS
-- ===========================================================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null default '',
  age integer,
  sex text not null default '',
  group_id uuid references customer_groups(id) on delete set null,
  notes text not null default '',
  created_at timestamptz default now()
);
alter table customers enable row level security;
create policy "owner" on customers for all
  using (business_id in (select id from businesses where user_id = auth.uid()));

-- ===========================================================
-- ORDERS
-- ===========================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null default '',
  items jsonb not null default '[]',
  discount numeric(12,2) not null default 0,
  discount_type text not null default 'amount',
  status text not null default 'pending',
  due_date date,
  date date not null default current_date,
  note text not null default '',
  payment_method text not null default 'efectivo',
  created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "owner" on orders for all
  using (business_id in (select id from businesses where user_id = auth.uid()));
create index if not exists idx_orders_business_date on orders(business_id, date);
create index if not exists idx_orders_status on orders(business_id, status);

-- ===========================================================
-- EXPENSES
-- ===========================================================
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  category text not null default 'otros',
  note text not null default '',
  date date not null default current_date,
  created_at timestamptz default now()
);
alter table expenses enable row level security;
create policy "owner" on expenses for all
  using (business_id in (select id from businesses where user_id = auth.uid()));

-- ===========================================================
-- SOCIAL METRICS
-- ===========================================================
create table if not exists social_metrics (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  platform text not null,
  week_start date not null,
  reach integer not null default 0,
  interactions integer not null default 0,
  new_followers integer not null default 0,
  posts integer not null default 0,
  created_at timestamptz default now(),
  unique(business_id, platform, week_start)
);
alter table social_metrics enable row level security;
create policy "owner" on social_metrics for all
  using (business_id in (select id from businesses where user_id = auth.uid()));

-- ===========================================================
-- APPOINTMENTS
-- ===========================================================
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'otro',
  date timestamptz not null,
  created_at timestamptz default now()
);
alter table appointments enable row level security;
create policy "owner" on appointments for all
  using (business_id in (select id from businesses where user_id = auth.uid()));

-- =========== v2 ===========

-- Brota — Schema v2: fiado, catálogo público y multi-emprendimiento
-- Ejecutar en el SQL Editor de Supabase DESPUÉS del schema base.

-- ===========================================================
-- 1. FIADO: pedidos con pago pendiente
-- ===========================================================
alter table orders
  add column if not exists paid boolean not null default true;

create index if not exists idx_orders_unpaid on orders(business_id) where paid = false;

-- ===========================================================
-- 2. CATÁLOGO PÚBLICO: slug + WhatsApp del negocio + fotos
-- ===========================================================
alter table businesses
  add column if not exists slug text unique,
  add column if not exists whatsapp text not null default '';

alter table products
  add column if not exists image_url text;

-- Acceso público al catálogo (brotaonline.com/tienda/<slug>) vía funciones
-- que exigen conocer el slug exacto: no se puede listar todos los negocios
-- ni cosechar números de WhatsApp en masa. Exponen SOLO columnas públicas
-- (nunca cost_price, clientes ni ventas).
drop view if exists catalog_products;
drop view if exists catalog_businesses;

create or replace function public.catalog_business(p_slug text)
returns table (id uuid, name text, slug text, whatsapp text, currency text)
language sql stable security definer set search_path = public
as $$
  select id, name, slug, whatsapp, currency
  from businesses
  where slug = p_slug;
$$;

create or replace function public.catalog_products(p_slug text)
returns table (id uuid, name text, sale_price numeric, stock integer, image_url text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.sale_price, p.stock, p.image_url
  from products p
  join businesses b on b.id = p.business_id
  where b.slug = p_slug
  order by p.name;
$$;

grant execute on function public.catalog_business(text) to anon, authenticated;
grant execute on function public.catalog_products(text) to anon, authenticated;

-- Fotos de productos: bucket público de Storage.
-- Lectura pública (el catálogo las muestra); escritura solo del dueño
-- del negocio (la carpeta raíz del archivo es el id de su negocio).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "fotos: lectura publica" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "fotos: sube el dueño" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in
      (select id::text from businesses where user_id = auth.uid())
  );

create policy "fotos: actualiza el dueño" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in
      (select id::text from businesses where user_id = auth.uid())
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in
      (select id::text from businesses where user_id = auth.uid())
  );

create policy "fotos: borra el dueño" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in
      (select id::text from businesses where user_id = auth.uid())
  );

-- ===========================================================
-- 3. LÍMITES DEL PLAN GRATUITO EN EL SERVIDOR
-- ===========================================================
-- La UI ya limita, pero el servidor es la única barrera real:
-- sin esto, cualquiera podría saltarse los límites llamando a la
-- API directo con su token. Free: 1 emprendimiento, 21 productos,
-- 32 clientes, 42 ventas/mes, 21 gastos/mes. Pro: sin límites.
create or replace function public.enforce_free_limits()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid;
  v_count int;
  v_exists boolean;
begin
  -- La app sincroniza con upsert: si la fila ya existe es una edición,
  -- no un alta — no cuenta contra el límite
  execute format('select exists(select 1 from %I where id = $1)', tg_table_name)
    into v_exists using new.id;
  if v_exists then return new; end if;

  if tg_table_name = 'businesses' then
    v_user := new.user_id;
  else
    select user_id into v_user from businesses where id = new.business_id;
  end if;

  if coalesce((select plan from user_plans where user_id = v_user), 'free') = 'pro' then
    return new;
  end if;

  if tg_table_name = 'businesses' then
    select count(*) into v_count from businesses where user_id = v_user;
    if v_count >= 1 then raise exception 'Plan gratuito: máximo 1 emprendimiento'; end if;
  elsif tg_table_name = 'products' then
    select count(*) into v_count from products where business_id = new.business_id;
    if v_count >= 21 then raise exception 'Plan gratuito: máximo 21 productos'; end if;
  elsif tg_table_name = 'customers' then
    select count(*) into v_count from customers where business_id = new.business_id;
    if v_count >= 32 then raise exception 'Plan gratuito: máximo 32 clientes'; end if;
  elsif tg_table_name = 'orders' then
    select count(*) into v_count from orders
      where business_id = new.business_id
      and date_trunc('month', date) = date_trunc('month', new.date);
    if v_count >= 42 then raise exception 'Plan gratuito: máximo 42 ventas por mes'; end if;
  elsif tg_table_name = 'expenses' then
    select count(*) into v_count from expenses
      where business_id = new.business_id
      and date_trunc('month', date) = date_trunc('month', new.date);
    if v_count >= 21 then raise exception 'Plan gratuito: máximo 21 gastos por mes'; end if;
  end if;

  return new;
end;
$$;

drop trigger if exists free_limit_businesses on businesses;
create trigger free_limit_businesses before insert on businesses
  for each row execute function enforce_free_limits();
drop trigger if exists free_limit_products on products;
create trigger free_limit_products before insert on products
  for each row execute function enforce_free_limits();
drop trigger if exists free_limit_customers on customers;
create trigger free_limit_customers before insert on customers
  for each row execute function enforce_free_limits();
drop trigger if exists free_limit_orders on orders;
create trigger free_limit_orders before insert on orders
  for each row execute function enforce_free_limits();
drop trigger if exists free_limit_expenses on expenses;
create trigger free_limit_expenses before insert on expenses
  for each row execute function enforce_free_limits();

-- =========== v3 ===========

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

-- =========== v4 (seguridad) ===========

-- Brota — Schema v4: hardening de seguridad del catálogo público
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de v1, v2 y v3.

-- ===========================================================
-- 1. NO FILTRAR EL COSTO DE LAS VARIANTES EN EL CATÁLOGO PÚBLICO
-- ===========================================================
-- catalog_products devolvía la columna `variants` completa, y cada
-- variante incluye `costPrice` (el costo del producto). Cualquier
-- visitante del catálogo podía ver el margen del negocio abriendo las
-- herramientas de desarrollador del navegador. Se reconstruye el JSON
-- sacando `costPrice` de cada variante antes de devolverlo.
drop function if exists public.catalog_products(text);
create or replace function public.catalog_products(p_slug text)
returns table (id uuid, name text, sale_price numeric, stock integer, image_url text, variants jsonb)
language sql stable security definer set search_path = public
as $$
  select
    p.id, p.name, p.sale_price, p.stock, p.image_url,
    case
      when p.variants is null then null
      else (
        select jsonb_agg(v - 'costPrice')
        from jsonb_array_elements(p.variants) v
      )
    end as variants
  from products p
  join businesses b on b.id = p.business_id
  where b.slug = p_slug
  order by p.name;
$$;

grant execute on function public.catalog_products(text) to anon, authenticated;

-- ===========================================================
-- 2. LIMITAR TIPO Y TAMAÑO DE ARCHIVO EN EL BUCKET PÚBLICO
-- ===========================================================
-- Las políticas de Storage ya restringen quién puede subir (solo el
-- dueño del negocio, a su propia carpeta), pero no qué puede subir.
-- Esto limita el bucket a imágenes reales de hasta 5MB, para que nadie
-- pueda subir archivos arbitrarios (HTML, ejecutables, etc.) al bucket
-- público ni agotar espacio con archivos gigantes.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 5242880 -- 5 MB
where id = 'product-images';
