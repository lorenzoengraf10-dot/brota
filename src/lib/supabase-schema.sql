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
