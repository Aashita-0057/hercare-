"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./i18n";
import type { FacilityDTO } from "@/app/api/doctors/route";

const CACHE_KEY = "hc_facilities_cache_v1";

export interface Facets {
  states: string[];
  districts: string[];
  blocks: string[];
}

export interface SearchParams {
  q?: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  kind?: string;
  specialty?: string;
  ownership?: string;
  female?: boolean;
  category?: string;
}

/**
 * Facility search with offline caching: last successful non-sensitive
 * directory result is stored in localStorage with its timestamp; when the
 * network fails the cached list is served and flagged as offline data.
 */
export function useFacilities(params: SearchParams) {
  const [facilities, setFacilities] = useState<FacilityDTO[]>([]);
  const [facets, setFacets] = useState<Facets>({ states: [], districts: [], blocks: [] });
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setFromCache(false);
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === "" || v === false) continue;
      qs.set(k, v === true ? "1" : String(v));
    }
    try {
      const data = await api(`/api/doctors?${qs}`);
      setFacilities(data.facilities);
      setFacets(data.facets);
      const stamp = new Date().toISOString();
      setLastUpdated(stamp);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ stamp, facilities: data.facilities, facets: data.facets, params }));
      } catch { /* storage full — ignore */ }
    } catch {
      // Offline / server error → serve the cached directory if present.
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached?.facilities) {
          setFacilities(cached.facilities);
          setFacets(cached.facets || { states: [], districts: [], blocks: [] });
          setLastUpdated(cached.stamp);
          setFromCache(true);
        } else {
          setFacilities([]);
        }
      } catch {
        setFacilities([]);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { facilities, facets, loading, fromCache, lastUpdated, reload: load };
}

// Returns a translation key for known kinds; unknown kinds come back as a
// literal marker ("lit:...") so callers render them as-is.
export function kindLabel(kind: string): string {
  const known = [
    "doctor", "hospital", "clinic", "phc", "chc", "rehab",
    "psychiatric", "counsellor", "ngo", "support_centre", "legal_aid",
  ];
  return known.includes(kind) ? `kl_${kind}` : `lit:${kind}`;
}
