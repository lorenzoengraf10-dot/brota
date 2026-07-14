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
