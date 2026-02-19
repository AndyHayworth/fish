"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { isJustIn } from "@/lib/utils/format";
import { Plus, Package } from "lucide-react";
import type { Shipment } from "@/types";
import { format } from "date-fns";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<(Shipment & { item_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("shipments")
        .select("*, listing_items(count)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      setShipments(
        (data ?? []).map((s: Shipment & { listing_items: { count: number }[] }) => ({
          ...s,
          item_count: s.listing_items?.[0]?.count ?? 0,
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-6 h-6 border-2 border-[#1B6B4A] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Shipments</h1>
        <Link href="/dashboard/shipments/new">
          <Button size="sm">
            <Plus size={15} /> New shipment
          </Button>
        </Link>
      </div>

      {shipments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No shipments yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a shipment to batch-add items with a &ldquo;Just In&rdquo; badge.
          </p>
          <Link href="/dashboard/shipments/new">
            <Button>Create first shipment</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {shipment.label ?? format(new Date(shipment.arrival_date), "MMM d, yyyy")}
                    </h3>
                    {isJustIn(shipment.arrival_date) && (
                      <Badge variant="green">Just In</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Arrived {format(new Date(shipment.arrival_date), "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="gray">{shipment.item_count} items</Badge>
              </div>
              <Link
                href={`/dashboard/shipments/${shipment.id}/add`}
                className="mt-3 text-sm text-[#1B6B4A] font-medium hover:underline"
              >
                + Add items to shipment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
