"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExternalLink } from "lucide-react";
import type { Seller } from "@/types";

export default function ProfilePage() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");
  const [ships, setShips] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        const s = data as Seller;
        setSeller(s);
        setBusinessName(s.business_name);
        setCity(s.location_city ?? "");
        setState(s.location_state ?? "");
        setBio(s.bio ?? "");
        setPhone(s.contact_phone ?? "");
        setEmail(s.contact_email ?? "");
        setInstagram(s.contact_instagram ?? "");
        setFacebook(s.contact_facebook ?? "");
        setWebsite(s.contact_website ?? "");
        setShips(s.ships);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("sellers")
      .update({
        business_name: businessName,
        location_city: city || null,
        location_state: state || null,
        bio: bio || null,
        contact_phone: phone || null,
        contact_email: email || null,
        contact_instagram: instagram || null,
        contact_facebook: facebook || null,
        contact_website: website || null,
        ships,
      })
      .eq("id", seller?.id ?? "");

    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-6 h-6 border-2 border-[#1B6B4A] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Profile & Settings</h1>
        {seller && (
          <a
            href={`/${seller.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1B6B4A] flex items-center gap-1 hover:underline"
          >
            View board <ExternalLink size={11} />
          </a>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Store info</h2>
          <Input
            label="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              maxLength={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Bio <span className="text-gray-400 font-normal">(280 chars)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#1B6B4A] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/20"
            />
            <p className="text-xs text-gray-400 text-right">{bio.length}/280</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Contact</h2>
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Contact email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
          <Input label="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          <Input label="Website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ships"
              checked={ships}
              onChange={(e) => setShips(e.target.checked)}
              className="w-4 h-4 accent-[#1B6B4A]"
            />
            <label htmlFor="ships" className="text-sm text-gray-700">Willing to ship</label>
          </div>
        </div>

        {seller && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-1">Your URL</h2>
            <p className="text-sm text-gray-500 font-mono">stockboard.app/{seller.slug}</p>
            <p className="text-xs text-gray-400 mt-1">URL can be changed once — contact support.</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={saving}>
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
