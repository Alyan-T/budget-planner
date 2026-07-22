-- Budget Planner: Supabase schema + Row Level Security policies
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

-- 1. Categories -------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

-- 2. Transactions -------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  raw_input text,
  ai_confidence numeric(3, 2),
  occurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc);

-- 3. Budgets ------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month date not null, -- always the 1st of the month, e.g. 2026-07-01
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

-- 4. Row Level Security -------------------------------------------------------
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Categories: a user can only see/manage their own rows
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- Transactions: a user can only see/manage their own rows
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- Budgets: a user can only see/manage their own rows
create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- 5. Seed a few default categories for a given user (optional) ---------------
-- Replace :user_id with an actual auth.users.id after signing up once,
-- then run this block to get started quickly.
--
-- insert into public.categories (user_id, name, type) values
--   (:user_id, 'Salary', 'income'),
--   (:user_id, 'Groceries', 'expense'),
--   (:user_id, 'Gas', 'expense'),
--   (:user_id, 'Rent', 'expense'),
--   (:user_id, 'Entertainment', 'expense');
