create type public.app_role as enum ('customer', 'provider');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  created_at timestamptz not null default now()
);

create table public.provider_business (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null default '',
  description text not null default '',
  service_area text not null default '',
  website text not null default '',
  sections jsonb not null default '["services", "about", "portfolio"]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  caption text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acct text;
begin
  acct := coalesce(new.raw_user_meta_data->>'account_type', 'customer');
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  );
  if acct = 'provider' then
    insert into public.user_roles (user_id, role) values (new.id, 'provider');
  end if;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_business TO authenticated;
GRANT ALL ON public.provider_business TO service_role;
GRANT SELECT ON public.portfolio_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT ALL ON public.portfolio_items TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can view own business"
  ON public.provider_business FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Providers can insert own business"
  ON public.provider_business FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can update own business"
  ON public.provider_business FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view portfolio items"
  ON public.portfolio_items FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Providers can insert own portfolio items"
  ON public.portfolio_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can update own portfolio items"
  ON public.portfolio_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can delete own portfolio items"
  ON public.portfolio_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);