"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Seller } from "@/types";

export function useSeller() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", user.id)
        .single();

      setSeller(data as Seller | null);
      setLoading(false);
    }

    load();
  }, []);

  return { seller, loading };
}
