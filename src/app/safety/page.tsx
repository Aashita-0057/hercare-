"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api, useI18n } from "@/lib/i18n";
import { Banner, PageSpinner } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

interface Helpline {
  id: string;
  name: string;
  number: string;
  description: string;
  isEmergency: boolean;
  availability: string | null;
}

const EVIDENCE_KEYS = ["ev1", "ev2", "ev3", "ev4", "ev5"];

// Translated short descriptions for the known government numbers; anything
// else shows the description stored in the database.
const HELPLINE_DESC_KEY: Record<string, string> = {
  "112": "hl112d", "181": "hl181d", "1098": "hl1098d", "1090": "hl1090d", "14567": "hl14567d", "1800-11-2356": "hlQuitd",
};

export default function SafetyPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <SafetyInner />
    </Suspense>
  );
}

function SafetyInner() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const [helplines, setHelplines] = useState<Helpline[]>([]);
  const showEvidence = sp.get("section") === "evidence";

  useEffect(() => {
    api("/api/helplines").then((d) => setHelplines(d.helplines)).catch(() => {});
  }, []);

  const emergencies = helplines.filter((h) => h.isEmergency);
  const others = helplines.filter((h) => !h.isEmergency);
  const hDesc = (h: Helpline) => HELPLINE_DESC_KEY[h.number] ? t(HELPLINE_DESC_KEY[h.number]) : h.description;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-danger p-5 text-center text-white">
        <p className="text-3xl">🛡</p>
        <h1 className="text-2xl font-black">{t("womenSafetyTitle")}</h1>
        <p className="mt-1 font-semibold">{t("youDeserveSafe")}</p>
        <div className="mt-3">
          <AudioButton text={`${t("youDeserveSafe")} ${t("emergency112")}`} label={t("hearIt")} />
        </div>
      </div>

      {/* A. Emergency help — visible without login too (page stays open via bottom nav) */}
      <section className="rounded-2xl border-4 border-danger bg-white p-4">
        <h2 className="mb-3 text-lg font-black text-danger">{t("emergencyHelpTitle")}</h2>
        <div className="space-y-2">
          {(emergencies.length ? emergencies : [
            { id: "112", name: "Emergency Response Support System", number: "112", description: t("hl112d"), isEmergency: true, availability: "24×7" },
          ]).map((h) => (
            <a
              key={h.id}
              href={`tel:${h.number}`}
              className="flex items-center justify-between rounded-2xl bg-danger px-4 py-4 text-white hover:bg-danger-dark"
            >
              <span>
                <span className="block text-2xl font-black">📞 {h.number}</span>
                <span className="text-xs font-semibold">{h.name} — {hDesc(h)}</span>
                {h.availability && <span className="block text-[10px] opacity-80">{h.availability}</span>}
              </span>
              <span className="text-3xl" aria-hidden>→</span>
            </a>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink/50">{t("safetyNoLoginNote")}</p>
      </section>

      {others.length > 0 && (
        <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
          <h2 className="mb-2 font-extrabold">{t("helplines")}</h2>
          {others.map((h) => (
            <a key={h.id} href={`tel:${h.number}`} className="mb-2 flex items-center justify-between rounded-xl bg-sage-50 px-3 py-2.5 hover:bg-sage-100">
              <span>
                <b>{h.number}</b> · {h.name}
                <span className="block text-xs text-ink/60">{hDesc(h)}{h.availability ? ` · ${h.availability}` : ""}</span>
              </span>
              <span aria-hidden>📞</span>
            </a>
          ))}
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {/* B. Report harassment */}
        <Link href="/safety/report" className="rounded-2xl border-2 border-rose-200 bg-white p-4 hover:bg-rose-50">
          <h2 className="font-extrabold">B. 📝 {t("reportHarassment")}</h2>
          <p className="mt-1 text-sm text-ink/70">{t("reportDesc")}</p>
          <p className="mt-2 rounded-lg bg-caution/10 px-2 py-1 text-xs font-bold text-caution">
            ⚠ {t("thisIsNotEmergency")}
          </p>
        </Link>

        {/* D. Nearby help */}
        <Link href="/safety/nearby" className="rounded-2xl border-2 border-sage-200 bg-white p-4 hover:bg-sage-50">
          <h2 className="font-extrabold">D. 📍 {t("nearbyHelp")}</h2>
          <p className="mt-1 text-sm text-ink/70">{t("nearbyDesc")}</p>
        </Link>
      </div>

      {/* C. AI support assistant pointer */}
      <section className="rounded-2xl border-2 border-sage-300 bg-sage-50 p-4">
        <h2 className="font-extrabold">C. 💬 {t("aiAssistant")}</h2>
        <p className="mt-1 text-sm text-ink/70">{t("aiSupportDesc")}</p>
        <p className="mt-1 text-xs text-ink/50">{t("aiSupportNote")}</p>
      </section>

      {/* E. Evidence & safety guide */}
      <section className="rounded-2xl border-2 border-rose-200 bg-white p-4" id="evidence">
        <h2 className="mb-2 flex items-center justify-between font-extrabold">
          E. 🗂 {t("evidenceTitle")}
          <AudioButton text={EVIDENCE_KEYS.map((k) => t(k)).join(" ")} label={t("hearGuide")} />
        </h2>
        <ul className="space-y-2 text-sm">
          {EVIDENCE_KEYS.map((k, i) => (
            <li key={k} className={`rounded-xl p-2.5 ${i === 4 ? "bg-caution/10 font-semibold text-caution" : "bg-rose-50"}`}>
              {t(k)}
            </li>
          ))}
        </ul>
        {showEvidence && <Banner kind="info" text={t("evOpenedNote")} />}
      </section>

      {/* F. multilingual note */}
      <p className="text-center text-xs text-ink/50">{t("voiceNote")}</p>
    </div>
  );
}
