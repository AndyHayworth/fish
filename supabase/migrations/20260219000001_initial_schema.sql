-- Enable required extensions
create extension if not exists "pg_trgm";
create extension if not exists "uuid-ossp";

-- ============================================================
-- SELLERS
-- ============================================================
create table public.sellers (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  business_name text not null,
  slug text not null unique,
  location_city text,
  location_state text,
  bio text check (char_length(bio) <= 280),
  profile_photo_url text,
  contact_phone text,
  contact_email text,
  contact_instagram text,
  contact_facebook text,
  contact_website text,
  ships boolean not null default false,
  store_hours jsonb,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'shop')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sellers enable row level security;

create policy "Sellers are publicly viewable"
  on public.sellers for select using (true);

create policy "Sellers can insert their own profile"
  on public.sellers for insert
  with check (auth.uid() = id);

create policy "Sellers can update their own profile"
  on public.sellers for update
  using (auth.uid() = id);

-- ============================================================
-- SPECIES DATABASE
-- ============================================================
create table public.species (
  id uuid primary key default uuid_generate_v4(),
  scientific_name text not null,
  common_name text not null,
  category text not null check (category in ('freshwater_fish','saltwater_fish','coral_frags','invertebrates','live_plants','other')),
  family text,
  temp_min numeric(4,1),
  temp_max numeric(4,1),
  ph_min numeric(3,1),
  ph_max numeric(3,1),
  max_size_inches numeric(5,2),
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  aggression text check (aggression in ('peaceful','semi_aggressive','aggressive')),
  aliases jsonb not null default '[]',
  is_verified boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.species enable row level security;

create policy "Species are publicly viewable"
  on public.species for select using (true);

create policy "Authenticated users can insert unverified species"
  on public.species for insert
  with check (auth.uid() is not null and is_verified = false);

-- Trigram index for fuzzy species search
create index species_common_name_trgm_idx on public.species using gin (common_name gin_trgm_ops);
create index species_scientific_name_trgm_idx on public.species using gin (scientific_name gin_trgm_ops);

-- ============================================================
-- SHIPMENTS
-- ============================================================
create table public.shipments (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.sellers (id) on delete cascade not null,
  label text,
  arrival_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.shipments enable row level security;

create policy "Shipments are publicly viewable"
  on public.shipments for select using (true);

create policy "Sellers can manage their own shipments"
  on public.shipments for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- ============================================================
-- LISTING ITEMS
-- ============================================================
create table public.listing_items (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.sellers (id) on delete cascade not null,
  species_id uuid references public.species (id) on delete set null,
  custom_species_name text,
  category text not null check (category in ('freshwater_fish','saltwater_fish','coral_frags','invertebrates','live_plants','other')),
  common_name text not null,
  scientific_name text,
  quantity_type text not null default 'qualitative' check (quantity_type in ('exact','qualitative')),
  quantity_exact integer check (quantity_exact >= 0),
  quantity_label text check (quantity_label in ('in_stock','limited','sold_out','coming_soon')),
  size_label text,
  price_low numeric(10,2) check (price_low >= 0),
  price_high numeric(10,2) check (price_high >= 0),
  notes text check (char_length(notes) <= 500),
  is_wysiwyg boolean not null default false,
  is_active boolean not null default true,
  is_archived boolean not null default false,
  shipment_id uuid references public.shipments (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quantity_set check (
    (quantity_type = 'exact' and quantity_exact is not null) or
    (quantity_type = 'qualitative' and quantity_label is not null)
  )
);

alter table public.listing_items enable row level security;

create policy "Active listing items are publicly viewable"
  on public.listing_items for select
  using (is_archived = false);

create policy "Sellers can manage their own listing items"
  on public.listing_items for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create index listing_items_seller_id_idx on public.listing_items (seller_id);
create index listing_items_category_idx on public.listing_items (category);
create index listing_items_is_active_idx on public.listing_items (is_active);

-- ============================================================
-- LISTING PHOTOS
-- ============================================================
create table public.listing_photos (
  id uuid primary key default uuid_generate_v4(),
  listing_item_id uuid references public.listing_items (id) on delete cascade not null,
  photo_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.listing_photos enable row level security;

create policy "Listing photos are publicly viewable"
  on public.listing_photos for select using (true);

create policy "Sellers can manage photos for their own items"
  on public.listing_photos for all
  using (
    auth.uid() = (
      select seller_id from public.listing_items where id = listing_item_id
    )
  )
  with check (
    auth.uid() = (
      select seller_id from public.listing_items where id = listing_item_id
    )
  );

-- ============================================================
-- NOTIFY REQUESTS
-- ============================================================
create table public.notify_requests (
  id uuid primary key default uuid_generate_v4(),
  listing_item_id uuid references public.listing_items (id) on delete cascade not null,
  buyer_email text,
  buyer_phone text,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  constraint contact_provided check (buyer_email is not null or buyer_phone is not null)
);

alter table public.notify_requests enable row level security;

create policy "Anyone can insert notify requests"
  on public.notify_requests for insert
  with check (true);

create policy "Sellers can view notify requests for their items"
  on public.notify_requests for select
  using (
    auth.uid() = (
      select seller_id from public.listing_items where id = listing_item_id
    )
  );

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sellers_updated_at
  before update on public.sellers
  for each row execute procedure public.handle_updated_at();

create trigger listing_items_updated_at
  before update on public.listing_items
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,  -- 5MB
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "Public read access for listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Sellers can upload their own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Sellers can update their own photos"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Sellers can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
