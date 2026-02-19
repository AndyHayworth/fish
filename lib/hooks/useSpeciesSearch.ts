"use client";

import { useState, useEffect } from "react";
import type { Species } from "@/types";

export function useSpeciesSearch(query: string) {
  const [results, setResults] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/species?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json() as Species[];
          setResults(data);
        }
      } catch {
        // aborted
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return { results, loading };
}
