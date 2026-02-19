"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewShipmentPage() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [arrivalDate, setArrivalDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("shipments")
      .insert({
        seller_id: user.id,
        label: label || null,
        arrival_date: arrivalDate,
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/shipments/${data.id}/add`);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">New shipment</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Shipment label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='e.g. "Feb Indo Shipment"'
        />
        <Input
          label="Arrival date"
          type="date"
          value={arrivalDate}
          onChange={(e) => setArrivalDate(e.target.value)}
          required
        />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create shipment & add items →
        </Button>
      </form>
    </div>
  );
}
