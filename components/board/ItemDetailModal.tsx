"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatQuantity, isJustIn, isAvailable } from "@/lib/utils/format";
import { CATEGORY_LABELS } from "@/types";
import { Bell, Thermometer, Droplets, Fish } from "lucide-react";
import type { ListingItemWithPhotos, SellerWithItems } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface Props {
  item: ListingItemWithPhotos;
  seller: SellerWithItems;
  onClose: () => void;
}

const DIFFICULTY_COLORS = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

const AGGRESSION_COLORS = {
  peaceful: "green",
  semi_aggressive: "yellow",
  aggressive: "red",
} as const;

export function ItemDetailModal({ item, seller, onClose }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySent, setNotifySent] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const available = isAvailable(item);
  const photos = item.listing_photos ?? [];
  const species = item.species;

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    setNotifying(true);
    const supabase = createClient();
    await supabase.from("notify_requests").insert({
      listing_item_id: item.id,
      buyer_email: notifyEmail,
    });
    setNotifySent(true);
    setNotifying(false);
  }

  if (notifyOpen) {
    return (
      <Modal open title="Notify me when restocked" onClose={() => setNotifyOpen(false)}>
        {notifySent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-semibold text-gray-900">You&apos;re on the list!</p>
            <p className="text-sm text-gray-500 mt-1">
              We&apos;ll email you when {item.common_name} is back in stock.
            </p>
            <Button className="mt-4 w-full" onClick={() => setNotifyOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleNotify} className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your email to be notified when{" "}
              <strong>{item.common_name}</strong> is restocked at{" "}
              {seller.business_name}.
            </p>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
            />
            <Button type="submit" loading={notifying} className="w-full">
              Notify me
            </Button>
          </form>
        )}
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose}>
      {/* Photos */}
      {photos.length > 0 && (
        <div className="relative -mx-5 -mt-5 mb-4">
          <div className="aspect-square overflow-hidden relative bg-gray-100">
            <Image
              src={photos[photoIndex].photo_url}
              alt={item.common_name}
              fill
              className="object-cover"
            />
          </div>
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === photoIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{item.common_name}</h2>
          {item.scientific_name && (
            <p className="text-sm text-gray-400 italic">{item.scientific_name}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {CATEGORY_LABELS[item.category]}
          </p>
        </div>
        {(item.price_low || item.price_high) && (
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1B6B4A]">
              {formatPrice(item.price_low, item.price_high)}
            </p>
            {item.size_label && (
              <p className="text-xs text-gray-400">{item.size_label}</p>
            )}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {item.shipments && isJustIn(item.shipments.arrival_date) && (
          <Badge variant="green">Just In</Badge>
        )}
        {item.is_wysiwyg && <Badge variant="blue">WYSIWYG</Badge>}
        <Badge variant={available ? "green" : "red"}>
          {formatQuantity(item)}
        </Badge>
        {species?.difficulty && (
          <Badge variant={DIFFICULTY_COLORS[species.difficulty]}>
            {species.difficulty.charAt(0).toUpperCase() + species.difficulty.slice(1)}
          </Badge>
        )}
        {species?.aggression && (
          <Badge variant={AGGRESSION_COLORS[species.aggression]}>
            {species.aggression === "semi_aggressive"
              ? "Semi-aggressive"
              : species.aggression.charAt(0).toUpperCase() + species.aggression.slice(1)}
          </Badge>
        )}
      </div>

      {/* Notes */}
      {item.notes && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-700">{item.notes}</p>
        </div>
      )}

      {/* Care info from species DB */}
      {species && (
        <div className="space-y-2 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Care info</h3>
          <div className="grid grid-cols-3 gap-2">
            {species.temp_min && species.temp_max && (
              <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                <Thermometer size={14} className="mx-auto text-orange-400 mb-0.5" />
                <p className="text-xs font-medium text-gray-700">
                  {species.temp_min}–{species.temp_max}°F
                </p>
                <p className="text-[10px] text-gray-400">Temp</p>
              </div>
            )}
            {species.ph_min && species.ph_max && (
              <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                <Droplets size={14} className="mx-auto text-blue-400 mb-0.5" />
                <p className="text-xs font-medium text-gray-700">
                  {species.ph_min}–{species.ph_max}
                </p>
                <p className="text-[10px] text-gray-400">pH</p>
              </div>
            )}
            {species.max_size_inches && (
              <div className="bg-green-50 rounded-xl p-2.5 text-center">
                <Fish size={14} className="mx-auto text-green-400 mb-0.5" />
                <p className="text-xs font-medium text-gray-700">
                  {species.max_size_inches}&quot;
                </p>
                <p className="text-[10px] text-gray-400">Max size</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact / notify */}
      <div className="space-y-2">
        {available ? (
          <ContactSellerButton seller={seller} />
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setNotifyOpen(true)}
          >
            <Bell size={16} />
            Notify me when restocked
          </Button>
        )}
      </div>
    </Modal>
  );
}

function ContactSellerButton({ seller }: { seller: SellerWithItems }) {
  const primary =
    seller.contact_phone
      ? { href: `tel:${seller.contact_phone}`, label: "Call / Text seller" }
      : seller.contact_email
      ? { href: `mailto:${seller.contact_email}`, label: "Email seller" }
      : seller.contact_instagram
      ? {
          href: `https://instagram.com/${seller.contact_instagram.replace("@", "")}`,
          label: "DM on Instagram",
        }
      : null;

  if (!primary) return null;

  return (
    <a
      href={primary.href}
      target={primary.href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full bg-[#1B6B4A] text-white font-medium px-4 py-3 rounded-xl hover:bg-[#134e37] transition-colors text-sm"
    >
      {primary.label}
    </a>
  );
}
