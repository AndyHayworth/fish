import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/dashboard/ItemForm";

export const metadata = { title: "Add Item" };

export default async function AddItemPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("sellers")
    .select("id, plan_tier")
    .eq("id", user.id)
    .single();

  if (!seller) redirect("/onboarding");

  // Check item limit
  const { count } = await supabase
    .from("listing_items")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .eq("is_archived", false);

  const limits = { free: 25, pro: 100, shop: Infinity };
  const maxItems = limits[seller.plan_tier as keyof typeof limits] ?? 25;

  if ((count ?? 0) >= maxItems) {
    redirect("/dashboard?error=item_limit");
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Add item</h1>
      <ItemForm
        sellerId={seller.id}
        planTier={seller.plan_tier as "free" | "pro" | "shop"}
      />
    </div>
  );
}
