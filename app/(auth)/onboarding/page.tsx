"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [ships, setShips] = useState(false);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("sellers").insert({
      id: user.id,
      email: user.email!,
      business_name: businessName,
      slug: slug || generateSlug(businessName),
      location_city: city || null,
      location_state: state || null,
      bio: bio || null,
      contact_phone: phone || null,
      contact_instagram: instagram || null,
      ships,
    });

    if (error) {
      if (error.code === "23505") {
        setError("That URL is already taken. Try a different one.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Set up your board</h1>
      <p className="text-sm text-gray-500 mb-6">
        Step {step} of 2 — {step === 1 ? "Your store" : "Contact & shipping"}
      </p>

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Input
              label="Store or breeder name"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (!slug) setSlug(generateSlug(e.target.value));
              }}
              placeholder="Mike's Tropical Fish"
              required
            />
            <Input
              label="Your public URL"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="mikes-tropical-fish"
              hint={`stockboard.app/${slug || "your-store"}`}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
              />
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Bio <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Family-owned fish store since 2005..."
                maxLength={280}
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
              />
              <p className="text-xs text-gray-400 text-right">{bio.length}/280</p>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Continue →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(512) 555-0100"
            />
            <Input
              label="Instagram handle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@mikestropicalfish"
            />
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="ships"
                checked={ships}
                onChange={(e) => setShips(e.target.checked)}
                className="w-4 h-4 rounded accent-[#1B6B4A]"
              />
              <label htmlFor="ships" className="text-sm text-gray-700">
                I&apos;m willing to ship livestock
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Launch my board 🎉
            </Button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              ← Back
            </button>
          </div>
        )}
      </form>
    </>
  );
}
