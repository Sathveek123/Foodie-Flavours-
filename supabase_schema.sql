-- =====================================================================
-- FLAVORA KITCHEN — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Copy and paste this directly into your Supabase SQL Editor.
-- =====================================================================

-- 1. Enable UUID generation extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now(),
  is_blocked boolean default false,
  loyalty_points int default 0
);

-- 3. Admin Users Table
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('owner','manager','chef','waiter','cashier','delivery','support')) default 'manager',
  created_at timestamptz default now()
);

-- 4. Restaurant Tables
create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  table_number int unique not null,
  capacity int not null,
  status text check (status in ('available','reserved','occupied','cleaning')) default 'available',
  created_at timestamptz default now()
);

-- 5. Seating Reservations
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  table_id uuid references public.restaurant_tables(id) on delete set null,
  guest_name text not null,
  guest_count int not null,
  reservation_date date not null,
  reservation_time text not null, -- E.g. '7:00 PM', '8:30 PM'
  occasion text,
  dining_package text,
  special_requests text,
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending',
  created_at timestamptz default now()
);

-- 6. Food Items Catalog
create table public.food_items (
  id int primary key, -- Uses the dish integer ID matching the frontend dataset
  name text not null,
  category text not null,
  price numeric not null,
  image_url text,
  is_available boolean default true,
  stock_status text check (stock_status in ('in_stock','low_stock','sold_out')) default 'in_stock',
  is_selling_fast boolean default false,
  created_at timestamptz default now()
);

-- 7. Orders Table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  items jsonb not null, -- Array of [{id, name, quantity, price, image}]
  subtotal numeric not null,
  fees jsonb not null, -- {gst, delivery, platform, tip}
  total numeric not null,
  delivery_address text not null,
  payment_status text check (payment_status in ('pending','paid','failed','refunded')) default 'pending',
  payment_method text not null,
  order_status text check (order_status in ('pending','accepted','preparing','packed','out_for_delivery','delivered','cancelled')) default 'pending',
  refund_status text check (refund_status in ('none','requested','processing','completed','denied')) default 'none',
  created_at timestamptz default now()
);

-- =====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, loyalty_points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Valued Guest'),
    coalesce(new.phone, ''),
    0
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.reservations enable row level security;
alter table public.food_items enable row level security;
alter table public.orders enable row level security;

-- Helper function to check if current user is an administrator
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where admin_users.id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 1. Profiles Policies
create policy "Users can view/edit own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Admins can view/manage all profiles" on public.profiles
  for all using (public.is_admin());

-- 2. Admin Users Policies
create policy "Admins can view admin list" on public.admin_users
  for select using (auth.uid() = id or public.is_admin());

create policy "Owners can manage admin list" on public.admin_users
  for all using (
    exists (
      select 1 from public.admin_users 
      where admin_users.id = auth.uid() and admin_users.role = 'owner'
    )
  );

-- 3. Restaurant Tables Policies
create policy "Tables are viewable by all authenticated users" on public.restaurant_tables
  for select using (auth.role() = 'authenticated');

create policy "Tables can be managed by admins only" on public.restaurant_tables
  for all using (public.is_admin());

-- 4. Reservations Policies
create policy "Users can view/edit own reservations" on public.reservations
  for select using (auth.uid() = user_id);

create policy "Users can insert own reservations" on public.reservations
  for insert with check (auth.uid() = user_id);

create policy "Users can cancel own pending reservations" on public.reservations
  for update using (auth.uid() = user_id and status = 'pending')
  with check (status = 'cancelled');

create policy "Admins can manage all reservations" on public.reservations
  for all using (public.is_admin());

-- 5. Food Items Policies
create policy "Food catalog is public viewable" on public.food_items
  for select using (true);

create policy "Food catalog is managed by admins" on public.food_items
  for all using (public.is_admin());

-- 6. Orders Policies
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can submit own orders" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage all orders" on public.orders
  for all using (public.is_admin());

-- =====================================================================
-- SEED INITIAL DATA
-- =====================================================================

-- Seed 5 standard dining tables
insert into public.restaurant_tables (table_number, capacity, status) values
(1, 2, 'available'),
(2, 2, 'available'),
(3, 4, 'available'),
(4, 6, 'available'),
(5, 12, 'available')
on conflict (table_number) do nothing;
