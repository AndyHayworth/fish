import type { ListingItem, QuantityLabel } from "@/types";
import { formatDistanceToNow, differenceInHours } from "date-fns";

export function formatPrice(low: number | null, high: number | null): string {
  if (!low && !high) return "Contact for price";
  if (!high || low === high) return `$${low}`;
  return `$${low}–$${high}`;
}

export function formatQuantity(item: ListingItem): string {
  if (item.quantity_type === "exact" && item.quantity_exact !== null) {
    return `${item.quantity_exact} available`;
  }
  const labels: Record<QuantityLabel, string> = {
    in_stock: "In Stock",
    limited: "Limited",
    sold_out: "Sold Out",
    coming_soon: "Coming Soon",
  };
  return labels[item.quantity_label ?? "in_stock"] ?? "In Stock";
}

export function isJustIn(arrivalDate: string): boolean {
  const hours = differenceInHours(new Date(), new Date(arrivalDate));
  return hours <= 72;
}

export function formatLastUpdated(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function isAvailable(item: ListingItem): boolean {
  if (!item.is_active || item.is_archived) return false;
  if (item.quantity_type === "exact" && (item.quantity_exact ?? 0) <= 0)
    return false;
  if (item.quantity_label === "sold_out") return false;
  return true;
}
