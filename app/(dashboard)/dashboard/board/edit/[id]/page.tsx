import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/dashboard/ItemForm";

export const metadata = { title: "Edit Item" };

export default async function EditItemPage({
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

  const { data: item } = await supabase
    .from("listing_items")
    .select("*, listing_photos(*)")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  if (!item) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit item</h1>
      <ItemForm
        sellerId={seller.id}
        planTier={seller.plan_tier as "free" | "pro" | "shop"}
        editItem={item}
      />
    </div>
  );
}
