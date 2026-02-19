"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSeller } from "@/lib/hooks/useSeller";
import { formatPrice, formatQuantity, isJustIn, isAvailable } from "@/lib/utils/format";
import { CATEGORY_LABELS } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Plus, Zap } from "lucide-react";
import type { ListingItemWithPhotos, Category } from "@/types";
import { ItemCard } from "@/components/dashboard/ItemCard";

export default function DashboardPage() {
  const { seller, loading: sellerLoading } = useSeller();
  const [items, setItems] = useState<ListingItemWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("listing_items")
      .select("*, listing_photos(*), species(*), shipments(*)")
      .eq("seller_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .eq("is_archived", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setItems((data as ListingItemWithPhotos[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (sellerLoading || loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-6 h-6 border-2 border-[#1B6B4A] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Profile not found.</p>
        <Link href="/onboarding">
          <Button>Complete setup</Button>
        </Link>
      </div>
    );
  }

  const activeItems = items.filter((i) => isAvailable(i));
  const soldOutItems = items.filter((i) => !isAvailable(i) && !i.is_archived);

  const grouped = items.reduce<Record<Category, ListingItemWithPhotos[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<Category, ListingItemWithPhotos[]>
  );

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-900">{seller.business_name}</h2>
            <a
              href={`/${seller.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1B6B4A] flex items-center gap-1 mt-0.5 hover:underline"
            >
              stockboard.app/{seller.slug}
              <ExternalLink size={11} />
            </a>
          </div>
          <Badge variant={seller.plan_tier === "free" ? "gray" : "green"}>
            {seller.plan_tier}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeItems.length}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{soldOutItems.length}</div>
            <div className="text-xs text-gray-500">Sold out</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/board/add">
          <button className="w-full bg-[#1B6B4A] text-white rounded-2xl p-4 flex items-center gap-3 hover:bg-[#134e37] transition-colors">
            <Plus size={20} />
            <span className="font-medium">Add item</span>
          </button>
        </Link>
        <Link href="/dashboard/shipments/new">
          <button className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Zap size={20} className="text-[#1B6B4A]" />
            <span className="font-medium">New shipment</span>
          </button>
        </Link>
      </div>

      {/* Item list by category */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">🐠</p>
          <h3 className="font-semibold text-gray-900 mb-1">Your board is empty</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first livestock listing to go live.</p>
          <Link href="/dashboard/board/add">
            <Button size="lg">Add first item</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.keys(grouped) as Category[]).map((category) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-2">
                {grouped[category].map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onUpdate={loadItems}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
