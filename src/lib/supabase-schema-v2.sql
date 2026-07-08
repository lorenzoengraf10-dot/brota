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
