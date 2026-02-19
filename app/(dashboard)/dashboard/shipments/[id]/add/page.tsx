import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/dashboard/ItemForm";

export const metadata = { title: "Add Items to Shipment" };

export default async function AddShipmentItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("sellers")
    .select("id, plan_tier")
    .eq("id", user.id)
    .single();
  if (!seller) redirect("/onboarding");

  const { data: shipment } = await supabase
    .from("shipments")
    .select("id, label, arrival_date")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();
  if (!shipment) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Add to shipment</h1>
      <p className="text-sm text-gray-500 mb-6">
        {shipment.label ?? "Unlabeled shipment"} · Items get a &ldquo;Just In&rdquo; badge for 72 hours
      </p>
      <ItemForm
        sellerId={seller.id}
        planTier={seller.plan_tier as "free" | "pro" | "shop"}
        defaultShipmentId={shipment.id}
      />
    </div>
  );
}
