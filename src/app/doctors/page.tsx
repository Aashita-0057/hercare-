"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useFacilities, type SearchParams } from "@/lib/useFacilities";
import FacilityCard from "@/components/FacilityCard";
import Guard from "@/components/Guard";
import { Banner, PageSpinner } from "@/components/ui";

const SPECIALTIES = ["specGyn", "specObs", "specGeneral", "specPeds", "specMental", "specAddiction"];

const KINDS = [
  { v: "", k: "kindAllFacilities" },
  { v: "government_hospital", k: "kindGovHosp" },
  { v: "private_clinic", k: "kindPrivateClinic" },
  { v: "phc", k: "kindPhc" },
  { v: "chc", k: "kindChc" },
  { v: "doctor", k: "kindDoctors" },
];

function DoctorsInner() {
  const { t } = useI18n();
  const sp = useSearchParams();

  const [text, setText] = useState(sp.get("q") || "");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [village, setVillage] = useState("");
  const [kind, setKind] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [female, setFemale] = useState(false);
  const [gpsMsg, setGpsMsg] = useState<string | null>(null);

  // Debounce free-text so typing doesn't spam requests.
  const [debounced, setDebounced] = useState(text);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 400);
    return () => clearTimeout(id);
  }, [text]);
  useEffect(() => {
    setDebounced(sp.get("q") || "");
    setText(sp.get("q") || "");
  }, [sp]);

  const params: SearchParams = {
    q: debounced || undefined,
    state: state || undefined,
    district: district || undefined,
    block: block || undefined,
    village: village || undefined,
    specialty: specialty || undefined,
    female,
    ownership: kind === "government_hospital" ? "government" : kind === "private_clinic" ? "private" : undefined,
    kind: ["phc", "chc", "doctor"].includes(kind) ? kind : undefined,
  };

  const { facilities, facets, loading, fromCache, lastUpdated } = useFacilities(params);

  // Optional GPS discovery — manual selection always works without it.
  function useGps() {
    if (!navigator.geolocation) {
      setGpsMsg(t("gpsUnsupported"));
      return;
    }
    setGpsMsg(t("gpsGetting"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // No reverse-geocoding key required: we store coords and let the user
        // confirm district; keeps privacy simple and honest.
        setGpsMsg(
          `${t("gpsCoordNote")} ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)} ${t("gpsPickDistrict")}`
        );
      },
      () => setGpsMsg(t("gpsDenied"))
    );
  }

  return (
    <Guard>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-rose-600">🩺 {t("doctorBlock")}</h1>
          <p className="text-sm text-ink/70">{t("doctorSub")}</p>
        </div>

        <Banner
          kind="sample"
          text={t("sampleDataBanner")}
        />
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-ink/70">{t("verifiedOnlyNote")}</p>

        {/* location controls — fully offline-friendly */}
        <div className="rounded-2xl border-2 border-sage-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(""); setBlock(""); }} aria-label={t("stateSelect")} className="min-w-0 flex-1 rounded-xl border-2 border-sage-200 bg-white px-3 py-2.5 text-sm">
              <option value="">📍 {t("stateSelect")}</option>
              {facets.states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={district} onChange={(e) => { setDistrict(e.target.value); setBlock(""); }} aria-label={t("districtSelect")} className="min-w-0 flex-1 rounded-xl border-2 border-sage-200 bg-white px-3 py-2.5 text-sm">
              <option value="">📍 {t("districtSelect")}</option>
              {facets.districts.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <select value={block} onChange={(e) => setBlock(e.target.value)} aria-label={t("blockSelect")} className="min-w-0 flex-1 rounded-xl border-2 border-sage-200 bg-white px-3 py-2.5 text-sm">
              <option value="">📍 {t("blockSelect")}</option>
              {facets.blocks.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder={`🏡 ${t("villageInput")}`} aria-label={t("villageInput")} className="min-w-0 flex-1 rounded-xl border-2 border-sage-200 px-3 py-2.5 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={useGps} className="rounded-full border-2 border-sage-300 px-3 py-1.5 text-xs font-bold">
              {t("useMyLocationBtn")}
            </button>
            {gpsMsg && <span className="self-center text-xs text-ink/70">{gpsMsg}</span>}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("searchDoctorsPh")}
              aria-label={t("search")}
              className="min-w-0 flex-1 rounded-xl border-2 border-rose-200 px-3 py-2.5 text-sm"
            />
          </div>

          {/* filters */}
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("filters")}>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-full border-2 border-sage-200 px-3 py-1.5 text-xs font-semibold" aria-label={t("filters")}>
              {KINDS.map((k) => <option key={k.v} value={k.v}>{t(k.k)}</option>)}
            </select>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="rounded-full border-2 border-sage-200 px-3 py-1.5 text-xs font-semibold" aria-label={t("anySpecialty")}>
              <option value="">{t("anySpecialty")}</option>
              {SPECIALTIES.map((s) => <option key={s}>{t(s)}</option>)}
            </select>
            <label className="flex items-center gap-1.5 rounded-full border-2 border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600">
              <input type="checkbox" checked={female} onChange={(e) => setFemale(e.target.checked)} className="h-4 w-4" />
              👩 {t("femaleDoctors")}
            </label>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-ink/50">
            {t("lastUpdated")}: {new Date(lastUpdated).toLocaleString()}
            {fromCache && t("showingSavedCopy")}
          </p>
        )}

        {loading ? (
          <PageSpinner />
        ) : facilities.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center font-semibold text-ink/60">
            {t("noResults")}
          </p>
        ) : (
          <div className="space-y-3">
            {facilities.map((f) => <FacilityCard key={f.id} f={f} />)}
          </div>
        )}
      </div>
    </Guard>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <DoctorsInner />
    </Suspense>
  );
}
