-- 0. Helper Function: Check if user is admin (if not exists)
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.admins
    where id = user_id
  );
$$;

-- 1. Table for Admin Activity Logs
create table if not exists public.admin_logs (
  id uuid default gen_random_uuid() primary key,
  admin_email text not null,
  action text not null, -- 'create', 'update', 'delete', 'login'
  entity text not null, -- 'product', 'order', 'coupon', 'settings'
  details jsonb, -- Flexible field for storing what changed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Only admins can view and insert logs
alter table public.admin_logs enable row level security;

create policy "Admins can view all logs"
  on public.admin_logs for select
  using ( is_admin(auth.uid()) );

create policy "Admins can insert logs"
  on public.admin_logs for insert
  with check ( is_admin(auth.uid()) );

-- 2. RPC Function for Dashboard KPI Stats
-- Returns: total_sales_month, total_orders_month, low_stock_count, total_products
create or replace function get_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_orders_month bigint;
  total_sales_month numeric;
  low_stock_count bigint;
  total_products bigint;
  start_of_month timestamp;
begin
  start_of_month := date_trunc('month', now());

  -- Orders this month
  select count(*), coalesce(sum(total), 0)
  into total_orders_month, total_sales_month
  from public.orders
  where created_at >= start_of_month;

  -- Low stock products (< 5)
  select count(*)
  into low_stock_count
  from public.products
  where stock < 5;

  -- Total active products
  select count(*)
  into total_products
  from public.products;

  return json_build_object(
    'orders_month', total_orders_month,
    'sales_month', total_sales_month,
    'low_stock', low_stock_count,
    'total_products', total_products
  );
end;
$$;

-- 3. RPC Function for Sales Chart (Last 30 days)
create or replace function get_daily_sales_chart()
returns table (
  date_label text,
  total_sales numeric,
  order_count bigint
)
language sql
security definer
as $$
  select
    to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date_label,
    sum(total) as total_sales,
    count(*) as order_count
  from public.orders
  where created_at > now() - interval '30 days'
  group by date_label
  order by date_label asc;
$$;
