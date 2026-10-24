"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import FacilityCard from "@/components/FacilityCard";
import { PageSpinner } from "@/components/ui";
import type { FacilityDTO } from "@/app/api/doctors/route";

export default function SavedFacilitiesPage() {
  const { t } = useI18n();
  const [list, setList] = useState<FacilityDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/favorites")
      .then((d) => setList(d.facilities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/profile" className="text-sm font-bold text-sage-700">← {t("profile")}</Link>
        <h1 className="text-2xl font-extrabold">⭐ {t("savedDoctorsTitle")}</h1>
        <p className="text-sm text-ink/70">{t("savedOnlyYou")}</p>

        {loading ? (
          <PageSpinner />
        ) : list.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center">
            <p className="font-semibold text-ink/60">{t("nothingSaved")}</p>
            <Link href="/doctors" className="mt-3 inline-block rounded-xl bg-rose-500 px-5 py-2.5 font-bold text-white">
              🔍 {t("findDoctor")}
            </Link>
          </div>
        ) : (
          list.map((f) => <FacilityCard key={f.id} f={f} />)
        )}
      </div>
    </Guard>
  );
}
