import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PublicBoard } from "@/components/board/PublicBoard";
import type { SellerWithItems } from "@/types";
import { formatLastUpdated } from "@/lib/utils/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: seller } = await supabase
    .from("sellers")
    .select("business_name, bio, location_city, location_state")
    .eq("slug", slug)
    .single();

  if (!seller) return { title: "Not Found" };

  const location = [seller.location_city, seller.location_state]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${seller.business_name} — Live Stock List`,
    description:
      seller.bio ??
      `Browse live aquarium livestock availability from ${seller.business_name}${location ? ` in ${location}` : ""}.`,
    openGraph: {
      title: `${seller.business_name} — Live Livestock Availability`,
      description:
        seller.bio ??
        `See what's in stock at ${seller.business_name}. Updated in real-time.`,
      type: "website",
    },
  };
}

export default async function PublicBoardPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!seller) notFound();

  const { data: items } = await supabase
    .from("listing_items")
    .select("*, listing_photos(*), species(*), shipments(*)")
    .eq("seller_id", seller.id)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const sellerWithItems: SellerWithItems = {
    ...seller,
    listing_items: items ?? [],
  };

  const lastUpdatedItem = items?.[0];
  const lastUpdated = lastUpdatedItem
    ? formatLastUpdated(lastUpdatedItem.updated_at)
    : null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seller.business_name,
    description: seller.bio,
    url: `https://stockboard.app/${slug}`,
    telephone: seller.contact_phone,
    email: seller.contact_email,
    address: seller.location_city
      ? {
          "@type": "PostalAddress",
          addressLocality: seller.location_city,
          addressRegion: seller.location_state,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicBoard
        seller={sellerWithItems}
        lastUpdated={lastUpdated}
      />
    </>
  );
}
