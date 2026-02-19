"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatQuantity, isJustIn, isAvailable } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Edit2, Archive, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ListingItemWithPhotos } from "@/types";

interface ItemCardProps {
  item: ListingItemWithPhotos;
  onUpdate: () => void;
}

export function ItemCard({ item, onUpdate }: ItemCardProps) {
  const [toggling, setToggling] = useState(false);
  const available = isAvailable(item);
  const justIn = item.shipments && isJustIn(item.shipments.arrival_date);

  async function toggleAvailability() {
    setToggling(true);
    const supabase = createClient();

    if (item.is_wysiwyg && available) {
      // WYSIWYG: archive on sold
      await supabase
        .from("listing_items")
        .update({ is_archived: true })
        .eq("id", item.id);
    } else {
      await supabase
        .from("listing_items")
        .update({ is_active: !item.is_active })
        .eq("id", item.id);
    }

    setToggling(false);
    onUpdate();
  }

  async function archiveItem() {
    if (!confirm("Archive this item?")) return;
    const supabase = createClient();
    await supabase
      .from("listing_items")
      .update({ is_archived: true })
      .eq("id", item.id);
    onUpdate();
  }

  const photo = item.listing_photos?.[0];

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 flex items-center gap-3 p-3 transition-opacity",
        !available && "opacity-60"
      )}
    >
      {/* Photo */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-gray-900 text-sm truncate">
            {item.common_name}
          </span>
          {justIn && (
            <Badge variant="green" className="text-[10px] px-1.5 py-0">Just In</Badge>
          )}
          {item.is_wysiwyg && (
            <Badge variant="blue" className="text-[10px] px-1.5 py-0">WYSIWYG</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{formatQuantity(item)}</span>
          {(item.price_low || item.price_high) && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-medium text-gray-700">
                {formatPrice(item.price_low, item.price_high)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleAvailability}
          disabled={toggling}
          className="p-2 rounded-lg text-gray-400 hover:text-[#1B6B4A] hover:bg-green-50 transition-colors"
          title={available ? "Mark sold out" : "Mark available"}
        >
          {available ? (
            <ToggleRight size={20} className="text-[#1B6B4A]" />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
        <Link
          href={`/dashboard/board/edit/${item.id}`}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Edit2 size={16} />
        </Link>
        <button
          onClick={archiveItem}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Archive"
        >
          <Archive size={16} />
        </button>
      </div>
    </div>
  );
}
