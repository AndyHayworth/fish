"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  Instagram,
  Facebook,
  Globe,
  Package,
  Grid3X3,
  List,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ItemDetailModal } from "@/components/board/ItemDetailModal";
import { cn } from "@/lib/utils/cn";
import {
  formatPrice,
  formatQuantity,
  isJustIn,
  isAvailable,
} from "@/lib/utils/format";
import { CATEGORY_LABELS } from "@/types";
import type { SellerWithItems, ListingItemWithPhotos, Category } from "@/types";

interface PublicBoardProps {
  seller: SellerWithItems;
  lastUpdated: string | null;
}

const ALL_CATEGORIES = "all";
type FilterCategory = Category | typeof ALL_CATEGORIES;

export function PublicBoard({ seller, lastUpdated }: PublicBoardProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>(ALL_CATEGORIES);
  const [showSoldOut, setShowSoldOut] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListingItemWithPhotos | null>(null);

  const availableItems = seller.listing_items.filter(
    (i): i is ListingItemWithPhotos => !i.is_archived
  );

  // Categories present in this board
  const presentCategories = useMemo(() => {
    const cats = new Set(availableItems.map((i) => i.category));
    return Array.from(cats) as Category[];
  }, [availableItems]);

  const justInItems = availableItems.filter(
    (i) => i.shipments && isJustIn(i.shipments.arrival_date) && isAvailable(i)
  );

  const filtered = useMemo(() => {
    return availableItems.filter((item) => {
      if (!showSoldOut && !isAvailable(item)) return false;
      if (categoryFilter !== ALL_CATEGORIES && item.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.common_name.toLowerCase().includes(q) ||
          (item.scientific_name?.toLowerCase().includes(q) ?? false) ||
          (item.notes?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [availableItems, showSoldOut, categoryFilter, search]);

  const grouped = useMemo(() => {
    if (categoryFilter !== ALL_CATEGORIES) {
      return { [categoryFilter]: filtered } as Record<Category, ListingItemWithPhotos[]>;
    }
    return filtered.reduce<Record<string, ListingItemWithPhotos[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered, categoryFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seller header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {seller.business_name}
              </h1>
              {(seller.location_city || seller.location_state) && (
                <p className="text-xs text-gray-400">
                  {[seller.location_city, seller.location_state]
                    .filter(Boolean)
                    .join(", ")}
                  {seller.ships && " · Ships nationwide"}
                </p>
              )}
              {lastUpdated && (
                <p className="text-xs text-gray-400">Updated {lastUpdated}</p>
              )}
            </div>

            {/* Contact CTA */}
            <ContactButton seller={seller} />
          </div>

          {seller.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{seller.bio}</p>
          )}

          {/* Contact row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {seller.contact_phone && (
              <a
                href={`tel:${seller.contact_phone}`}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1B6B4A]"
              >
                <Phone size={12} />
                {seller.contact_phone}
              </a>
            )}
            {seller.contact_email && (
              <a
                href={`mailto:${seller.contact_email}`}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1B6B4A]"
              >
                <Mail size={12} />
                Email
              </a>
            )}
            {seller.contact_instagram && (
              <a
                href={`https://instagram.com/${seller.contact_instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1B6B4A]"
              >
                <Instagram size={12} />
                {seller.contact_instagram}
              </a>
            )}
            {seller.contact_facebook && (
              <a
                href={seller.contact_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1B6B4A]"
              >
                <Facebook size={12} />
                Facebook
              </a>
            )}
            {seller.contact_website && (
              <a
                href={seller.contact_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1B6B4A]"
              >
                <Globe size={12} />
                Website
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search & filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search species..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCategoryFilter(ALL_CATEGORIES)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                categoryFilter === ALL_CATEGORIES
                  ? "bg-[#1B6B4A] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {presentCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  categoryFilter === cat
                    ? "bg-[#1B6B4A] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={showSoldOut}
                onChange={(e) => setShowSoldOut(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#1B6B4A]"
              />
              Show sold out
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"
                )}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"
                )}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Just In section */}
        {justInItems.length > 0 && !search && categoryFilter === ALL_CATEGORIES && (
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Badge variant="green">Just In</Badge>
              New arrivals (last 72 hours)
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {justInItems.slice(0, 4).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  view="grid"
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Main inventory */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No items match your filters</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category as Category]} ({items.length})
              </h2>
              <div
                className={cn(
                  view === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"
                )}
              >
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    view={view}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Powered by */}
        <div className="text-center py-4">
          <a
            href="/"
            className="text-xs text-gray-300 hover:text-gray-400"
          >
            Powered by StockBoard
          </a>
        </div>
      </main>

      {/* Item detail modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          seller={seller}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function ContactButton({ seller }: { seller: SellerWithItems }) {
  const [open, setOpen] = useState(false);

  const contactMethods = [
    seller.contact_phone && { label: "Call / Text", href: `tel:${seller.contact_phone}`, icon: Phone },
    seller.contact_email && { label: "Email", href: `mailto:${seller.contact_email}`, icon: Mail },
    seller.contact_instagram && {
      label: "Instagram",
      href: `https://instagram.com/${seller.contact_instagram.replace("@", "")}`,
      icon: Instagram,
    },
    seller.contact_facebook && { label: "Facebook", href: seller.contact_facebook, icon: Facebook },
    seller.contact_website && { label: "Website", href: seller.contact_website, icon: Globe },
  ].filter(Boolean) as { label: string; href: string; icon: React.ElementType }[];

  if (contactMethods.length === 0) return null;

  if (contactMethods.length === 1) {
    const { href, label, icon: Icon } = contactMethods[0];
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-1.5 bg-[#1B6B4A] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#134e37] transition-colors"
      >
        <Icon size={15} />
        {label}
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 bg-[#1B6B4A] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#134e37] transition-colors"
      >
        Contact seller
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Contact seller">
        <div className="space-y-2">
          {contactMethods.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Icon size={18} className="text-[#1B6B4A]" />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}

function ItemCard({
  item,
  view,
  onClick,
}: {
  item: ListingItemWithPhotos;
  view: "grid" | "list";
  onClick: () => void;
}) {
  const photo = item.listing_photos?.[0];
  const available = isAvailable(item);
  const justIn = item.shipments && isJustIn(item.shipments.arrival_date);

  if (view === "list") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left bg-white rounded-xl border border-gray-100 flex items-center gap-3 p-3 hover:border-[#1B6B4A]/30 transition-colors",
          !available && "opacity-60"
        )}
      >
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {photo ? (
            <Image
              src={photo.photo_url}
              alt={item.common_name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🐠</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{item.common_name}</span>
            {justIn && <Badge variant="green" className="text-[10px]">Just In</Badge>}
            {item.is_wysiwyg && <Badge variant="blue" className="text-[10px]">WYSIWYG</Badge>}
          </div>
          {item.scientific_name && (
            <p className="text-xs text-gray-400 italic">{item.scientific_name}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <AvailabilityBadge item={item} />
            {(item.price_low || item.price_high) && (
              <span className="text-sm font-semibold text-gray-800">
                {formatPrice(item.price_low, item.price_high)}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#1B6B4A]/30 transition-colors",
        !available && "opacity-60"
      )}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {photo ? (
          <Image
            src={photo.photo_url}
            alt={item.common_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🐠</div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {justIn && <Badge variant="green" className="text-[10px] shadow">Just In</Badge>}
          {item.is_wysiwyg && <Badge variant="blue" className="text-[10px] shadow">WYSIWYG</Badge>}
        </div>
        {!available && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Badge variant="gray">Sold Out</Badge>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-medium text-gray-900 leading-tight">{item.common_name}</p>
        {item.size_label && (
          <p className="text-xs text-gray-400">{item.size_label}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <AvailabilityBadge item={item} />
          {(item.price_low || item.price_high) && (
            <span className="text-sm font-bold text-[#1B6B4A]">
              {formatPrice(item.price_low, item.price_high)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function AvailabilityBadge({ item }: { item: ListingItemWithPhotos }) {
  const label = formatQuantity(item);
  const available = isAvailable(item);

  return (
    <span
      className={cn(
        "text-xs font-medium",
        available ? "text-green-600" : "text-gray-400"
      )}
    >
      {label}
    </span>
  );
}
