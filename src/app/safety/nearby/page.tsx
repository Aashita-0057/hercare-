"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { kindLabel, useFacilities } from "@/lib/useFacilities";
import FacilityCard from "@/components/FacilityCard";
import { Banner, PageSpinner } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

const KINDS = [
  { v: "", k: "allNearbyHelp" },
  { v: "support_centre", k: "kindSupportCentres" },
  { v: "ngo", k: "kindNgos" },
  { v: "legal_aid", k: "kindLegalAid" },
  { v: "hospital", k: "kindHospitals" },
  { v: "counsellor", k: "kindCounsellors" },
];

export default function NearbyHelpPage() {
  const { t } = useI18n();
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [kind, setKind] = useState("");

  const { facilities, facets, loading, fromCache, lastUpdated } = useFacilities({
    category: "support",
    ...(state ? { state } : {}),
    ...(district ? { district } : {}),
    ...(kind ? { kind } : {}),
  });

  return (
    <div className="space-y-4">
      <Link href="/safety" className="text-sm font-bold text-sage-700">← {t("safety")}</Link>
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-extrabold">📍 {t("nearbyHelp")}</h1>
        <AudioButton text={`${t("nearbyPageTitle")}. ${t("nearbyOfflineNote")}`} label={t("hearIt")} />
      </div>
      <Banner kind="sample" text={t("sampleDataBanner")} />

      <p className="text-sm text-ink/70">{t("nearbyOfflineNote")}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink/70">{t("stateLabel")}</span>
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setDistrict(""); }}
            className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 font-semibold"
          >
            <option value="">{t("allStatesOpt")}</option>
            {facets.states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink/70">{t("districtLabel")}</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 font-semibold"
          >
            <option value="">{t("allDistrictsOpt")}</option>
            {facets.districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.v}
            onClick={() => setKind(k.v)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
              kind === k.v ? "border-sage-600 bg-sage-600 text-white" : "border-sage-200 bg-white"
            }`}
          >
            {t(k.k)}
          </button>
        ))}
      </div>

      {fromCache && (
        <p className="rounded-xl bg-caution/10 px-3 py-2 text-xs font-bold text-caution">
          {t("offlineList")} {lastUpdated ? new Date(lastUpdated).toLocaleString() : t("offlineEarlier")}).
        </p>
      )}

      {loading ? (
        <PageSpinner />
      ) : facilities.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center font-semibold text-ink/60">
          {t("noResults")}
        </p>
      ) : (
        facilities.map((f) => <FacilityCard key={f.id} f={f} />)
      )}

      <p className="text-xs leading-relaxed text-ink/50">
        {kind ? `${t("showingKind")} ${kindLabel(kind).startsWith("lit:") ? kindLabel(kind).slice(4) : t(kindLabel(kind))}.` : t("showingAllKinds")}
      </p>
    </div>
  );
}
