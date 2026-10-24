"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useFacilities } from "@/lib/useFacilities";
import FacilityCard from "@/components/FacilityCard";
import Guard from "@/components/Guard";
import { Banner, PageSpinner } from "@/components/ui";

const FILTERS = [
  { v: "", label: "All recovery support" },
  { v: "rehab", label: "🏛 Rehabilitation centres" },
  { v: "psychiatric", label: "🧠 Psychiatric clinics" },
  { v: "counsellor", label: "💬 Counsellors" },
  { v: "ngo", label: "🤝 NGOs & govt-supported services" },
];

export default function RecoveryDirectoryPage() {
  const { t } = useI18n();
  const [kind, setKind] = useState("");
  const [womenOnly, setWomenOnly] = useState(false);
  const { facilities, loading } = useFacilities({ category: "rehab", ...(kind ? { kind } : {}) });

  const list = womenOnly ? facilities.filter((f) => f.hasWomenWard || f.kind === "rehab" || f.kind === "ngo") : facilities;

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/journal" className="text-sm font-bold text-sage-700">← {t("myJournal")}</Link>
        <h1 className="text-2xl font-extrabold">🏛 Women-centred recovery directory</h1>
        <Banner kind="sample" text={t("sampleDataBanner")} />

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setKind(f.v)}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                kind === f.v ? "border-sage-600 bg-sage-600 text-white" : "border-sage-200 bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setWomenOnly((w) => !w)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
              womenOnly ? "border-rose-500 bg-rose-500 text-white" : "border-rose-200 bg-white text-rose-600"
            }`}
          >
            👩 Women&apos;s wards / women-focused first
          </button>
        </div>

        {loading ? (
          <PageSpinner />
        ) : list.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center font-semibold text-ink/60">
            {t("noResults")}
          </p>
        ) : (
          list.map((f) => <FacilityCard key={f.id} f={f} />)
        )}

        <p className="text-xs leading-relaxed text-ink/50">
          Confidentiality and fee details appear only where a field team verified them. Before labelling any
          service &quot;free&quot; or &quot;anonymous&quot; we confirm live availability — until then the card says
          &ldquo;not verified&rdquo;, because wrong promises cost real journeys.
        </p>
      </div>
    </Guard>
  );
}
