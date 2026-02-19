"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSpeciesSearch } from "@/lib/hooks/useSpeciesSearch";
import { compressImage } from "@/lib/utils/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Camera, X, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ListingItem, Species, Category, QuantityLabel, QuantityType } from "@/types";
import { CATEGORY_LABELS, PLAN_LIMITS } from "@/types";

interface ItemFormProps {
  sellerId: string;
  planTier: "free" | "pro" | "shop";
  editItem?: ListingItem & { listing_photos?: { id: string; photo_url: string }[] };
  defaultShipmentId?: string;
}

const QUANTITY_LABELS: { value: QuantityLabel; label: string }[] = [
  { value: "in_stock", label: "In Stock" },
  { value: "limited", label: "Limited" },
  { value: "sold_out", label: "Sold Out" },
  { value: "coming_soon", label: "Coming Soon" },
];

export function ItemForm({ sellerId, planTier, editItem, defaultShipmentId }: ItemFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxPhotos = PLAN_LIMITS[planTier].maxPhotos;

  // Species
  const [speciesQuery, setSpeciesQuery] = useState(editItem?.common_name ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const { results: speciesSuggestions, loading: speciesLoading } = useSpeciesSearch(
    showSuggestions ? speciesQuery : ""
  );

  // Form state
  const [category, setCategory] = useState<Category>(editItem?.category ?? "freshwater_fish");
  const [commonName, setCommonName] = useState(editItem?.common_name ?? "");
  const [scientificName, setScientificName] = useState(editItem?.scientific_name ?? "");
  const [quantityType, setQuantityType] = useState<QuantityType>(editItem?.quantity_type ?? "qualitative");
  const [quantityExact, setQuantityExact] = useState(editItem?.quantity_exact?.toString() ?? "");
  const [quantityLabel, setQuantityLabel] = useState<QuantityLabel>(editItem?.quantity_label ?? "in_stock");
  const [sizeLabel, setSizeLabel] = useState(editItem?.size_label ?? "");
  const [priceLow, setPriceLow] = useState(editItem?.price_low?.toString() ?? "");
  const [priceHigh, setPriceHigh] = useState(editItem?.price_high?.toString() ?? "");
  const [notes, setNotes] = useState(editItem?.notes ?? "");
  const [isWysiwyg, setIsWysiwyg] = useState(editItem?.is_wysiwyg ?? false);

  // Photos
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; photo_url: string }[]>(
    editItem?.listing_photos ?? []
  );
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoUrls, setNewPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectSpecies(sp: Species) {
    setSelectedSpecies(sp);
    setCommonName(sp.common_name);
    setScientificName(sp.scientific_name);
    setCategory(sp.category);
    setSpeciesQuery(sp.common_name);
    setShowSuggestions(false);
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const available = maxPhotos - existingPhotos.length - newPhotos.length;
    if (available <= 0) {
      setError(`Your plan allows max ${maxPhotos} photo${maxPhotos > 1 ? "s" : ""} per item.`);
      return;
    }
    const toAdd = files.slice(0, available);
    const compressed = await Promise.all(toAdd.map(compressImage));
    const urls = compressed.map((f) => URL.createObjectURL(f));
    setNewPhotos((prev) => [...prev, ...compressed]);
    setNewPhotoUrls((prev) => [...prev, ...urls]);
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeExistingPhoto(photoId: string) {
    const supabase = createClient();
    await supabase.from("listing_photos").delete().eq("id", photoId);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  async function uploadPhotos(itemId: string): Promise<void> {
    if (newPhotos.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const currentOrder = existingPhotos.length;

    for (let i = 0; i < newPhotos.length; i++) {
      const file = newPhotos[i];
      const photoId = crypto.randomUUID();
      const path = `${sellerId}/${itemId}/${photoId}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { contentType: "image/webp" });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(path);
        await supabase.from("listing_photos").insert({
          listing_item_id: itemId,
          photo_url: publicUrl,
          sort_order: currentOrder + i,
        });
      }
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();

    const payload = {
      seller_id: sellerId,
      species_id: selectedSpecies?.id ?? editItem?.species_id ?? null,
      category,
      common_name: commonName,
      scientific_name: scientificName || null,
      quantity_type: quantityType,
      quantity_exact: quantityType === "exact" ? parseInt(quantityExact) || 0 : null,
      quantity_label: quantityType === "qualitative" ? quantityLabel : null,
      size_label: sizeLabel || null,
      price_low: priceLow ? parseFloat(priceLow) : null,
      price_high: priceHigh ? parseFloat(priceHigh) : null,
      notes: notes || null,
      is_wysiwyg: isWysiwyg,
      shipment_id: defaultShipmentId ?? editItem?.shipment_id ?? null,
    };

    let itemId: string;

    if (editItem) {
      const { error } = await supabase
        .from("listing_items")
        .update(payload)
        .eq("id", editItem.id);
      if (error) { setError(error.message); setSaving(false); return; }
      itemId = editItem.id;
    } else {
      const { data, error } = await supabase
        .from("listing_items")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) { setError(error?.message ?? "Failed to save"); setSaving(false); return; }
      itemId = data.id;
    }

    await uploadPhotos(itemId);
    router.push("/dashboard");
    router.refresh();
  }

  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Species search */}
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Species
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={speciesQuery}
            onChange={(e) => {
              setSpeciesQuery(e.target.value);
              setCommonName(e.target.value);
              setShowSuggestions(true);
              if (!e.target.value) setSelectedSpecies(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search by common or scientific name..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
            required
          />
        </div>
        {showSuggestions && speciesQuery.length >= 2 && (
          <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
            {speciesLoading && (
              <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
            )}
            {!speciesLoading && speciesSuggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No matches — will save as custom species
              </div>
            )}
            {speciesSuggestions.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => selectSpecies(sp)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <div className="font-medium text-gray-900">{sp.common_name}</div>
                <div className="text-xs text-gray-400">{sp.scientific_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
        >
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
        <div className="flex gap-2 mb-3">
          {(["qualitative", "exact"] as QuantityType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQuantityType(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium border transition-colors",
                quantityType === t
                  ? "bg-[#1B6B4A] text-white border-[#1B6B4A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1B6B4A]"
              )}
            >
              {t === "qualitative" ? "Label" : "Exact count"}
            </button>
          ))}
        </div>
        {quantityType === "qualitative" ? (
          <div className="grid grid-cols-2 gap-2">
            {QUANTITY_LABELS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuantityLabel(value)}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium border transition-colors",
                  quantityLabel === value
                    ? "bg-[#1B6B4A] text-white border-[#1B6B4A]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1B6B4A]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <Input
            type="number"
            value={quantityExact}
            onChange={(e) => setQuantityExact(e.target.value)}
            placeholder="0"
            min={0}
          />
        )}
      </div>

      {/* Price & Size */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (low)"
          type="number"
          value={priceLow}
          onChange={(e) => setPriceLow(e.target.value)}
          placeholder="0.00"
          min={0}
          step="0.01"
        />
        <Input
          label="Price (high)"
          type="number"
          value={priceHigh}
          onChange={(e) => setPriceHigh(e.target.value)}
          placeholder="optional"
          min={0}
          step="0.01"
        />
      </div>
      <Input
        label="Size"
        value={sizeLabel}
        onChange={(e) => setSizeLabel(e.target.value)}
        placeholder='e.g. "1 inch", "SM/MD/LG"'
      />

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Eating pellets, pair only..."
          maxLength={500}
          rows={2}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
        />
      </div>

      {/* WYSIWYG toggle */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
        <input
          type="checkbox"
          id="wysiwyg"
          checked={isWysiwyg}
          onChange={(e) => setIsWysiwyg(e.target.checked)}
          className="w-4 h-4 rounded accent-[#1B6B4A]"
        />
        <div>
          <label htmlFor="wysiwyg" className="text-sm font-medium text-gray-700">
            WYSIWYG item
          </label>
          <p className="text-xs text-gray-400">Photo is the primary identifier. Auto-archives when sold.</p>
        </div>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Photos ({totalPhotos}/{maxPhotos})
          </label>
          {planTier === "free" && (
            <span className="text-xs text-gray-400">Upgrade for more photos</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="relative w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.photo_url}
                alt="listing photo"
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removeExistingPhoto(photo.id)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {newPhotoUrls.map((url, i) => (
            <div key={url} className="relative w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="new photo" className="w-full h-full object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {totalPhotos < maxPhotos && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#1B6B4A] hover:text-[#1B6B4A] transition-colors"
            >
              <Camera size={20} />
              <span className="text-xs">Photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          loading={saving || uploading}
        >
          {editItem ? "Save changes" : "Add to board"}
        </Button>
      </div>
    </form>
  );
}
