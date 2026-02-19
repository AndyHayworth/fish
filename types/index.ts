export type PlanTier = "free" | "pro" | "shop";

export type Category =
  | "freshwater_fish"
  | "saltwater_fish"
  | "coral_frags"
  | "invertebrates"
  | "live_plants"
  | "other";

export type QuantityType = "exact" | "qualitative";

export type QuantityLabel =
  | "in_stock"
  | "limited"
  | "sold_out"
  | "coming_soon";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Aggression = "peaceful" | "semi_aggressive" | "aggressive";

export interface Seller {
  id: string;
  email: string;
  business_name: string;
  slug: string;
  location_city: string | null;
  location_state: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_instagram: string | null;
  contact_facebook: string | null;
  contact_website: string | null;
  ships: boolean;
  store_hours: StoreHours | null;
  plan_tier: PlanTier;
  created_at: string;
  updated_at: string;
}

export interface StoreHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface Species {
  id: string;
  scientific_name: string;
  common_name: string;
  category: Category;
  family: string | null;
  temp_min: number | null;
  temp_max: number | null;
  ph_min: number | null;
  ph_max: number | null;
  max_size_inches: number | null;
  difficulty: Difficulty | null;
  aggression: Aggression | null;
  aliases: string[];
  is_verified: boolean;
  created_at: string;
}

export interface ListingItem {
  id: string;
  seller_id: string;
  species_id: string | null;
  custom_species_name: string | null;
  category: Category;
  common_name: string;
  scientific_name: string | null;
  quantity_type: QuantityType;
  quantity_exact: number | null;
  quantity_label: QuantityLabel | null;
  size_label: string | null;
  price_low: number | null;
  price_high: number | null;
  notes: string | null;
  is_wysiwyg: boolean;
  is_active: boolean;
  is_archived: boolean;
  shipment_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joins
  listing_photos?: ListingPhoto[];
  species?: Species | null;
  shipments?: Shipment | null;
}

export interface ListingPhoto {
  id: string;
  listing_item_id: string;
  photo_url: string;
  sort_order: number;
  created_at: string;
}

export interface Shipment {
  id: string;
  seller_id: string;
  label: string | null;
  arrival_date: string;
  created_at: string;
}

export interface NotifyRequest {
  id: string;
  listing_item_id: string;
  buyer_email: string | null;
  buyer_phone: string | null;
  created_at: string;
  notified_at: string | null;
}

export interface SellerWithItems extends Seller {
  listing_items: ListingItemWithPhotos[];
}

export interface ListingItemWithPhotos extends ListingItem {
  listing_photos: ListingPhoto[];
  species: Species | null;
  shipments: Shipment | null;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  freshwater_fish: "Freshwater Fish",
  saltwater_fish: "Saltwater Fish",
  coral_frags: "Coral & Frags",
  invertebrates: "Invertebrates",
  live_plants: "Live Plants",
  other: "Other",
};

export const PLAN_LIMITS: Record<
  PlanTier,
  { maxItems: number; maxPhotos: number }
> = {
  free: { maxItems: 25, maxPhotos: 1 },
  pro: { maxItems: 100, maxPhotos: 3 },
  shop: { maxItems: Infinity, maxPhotos: 5 },
};
