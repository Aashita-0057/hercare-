"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { Banner, PageSpinner, PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";
import { SYMPTOMS } from "@/server/triage";

interface Result {
  level: "green" | "yellow" | "red";
}

const LEVEL_UI = {
  green: { emoji: "🟢", titleKey: "levelGreen", bg: "border-sage-500 bg-sage-50", text: "text-sage-700" },
  yellow: { emoji: "🟡", titleKey: "levelYellow", bg: "border-caution bg-caution/10", text: "text-caution" },
  red: { emoji: "🔴", titleKey: "levelRed", bg: "border-danger bg-danger/10", text: "text-danger" },
} as const;

// Guidance text is translated client-side; the API's English advice is not shown.
const ADVICE_KEY = { green: "adviceGreen", yellow: "adviceYellow", red: "adviceRed" } as const;

const CHECKUP_KEYS = ["ck1", "ck2", "ck3", "ck4", "ck5", "ck6"];

export default function ElderHealthPage() {
  const { t } = useI18n();
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ id: string; level: string; createdAt: string; symptoms: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("/api/health");
      setHistory(d.history);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setResult(null);
  };

  const check = async () => {
    setError(""); setBusy(true);
    try {
      const d = await api("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: picked }),
      });
      setResult({ level: d.level });
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const pickedLabels = SYMPTOMS.filter((s) => picked.includes(s.id)).map((s) => t(`sym_${s.id}`));
  const spoken = pickedLabels.length
    ? `${t("pickSymptoms")} ${pickedLabels.join(", ")}.`
    : t("elderIntro");

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/dashboard" className="text-sm font-bold text-sage-700">← {t("dashboard")}</Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold">👵 {t("elderCard")}</h1>
          <AudioButton text={spoken} label={t("hearIt")} />
        </div>

        <p className="rounded-xl bg-rose-50 p-3 text-sm text-ink/70">{t("elderExplain")}</p>

        {/* Visual symptom grid */}
        <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
          <h2 className="mb-3 font-extrabold">{t("elderHowFeel")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SYMPTOMS.map((s) => (
              <button key={s.id} onClick={() => toggle(s.id)} aria-pressed={picked.includes(s.id)}
                className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center text-xs font-bold ${
                  picked.includes(s.id) ? "border-rose-500 bg-rose-100" : "border-sage-200 bg-white"
                }`}>
                <span className="text-3xl" aria-hidden>{s.emoji}</span>
                {t(`sym_${s.id}`)}
              </button>
            ))}
          </div>
          {error && <p role="alert" className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm font-bold text-danger">{error}</p>}
          <PrimaryButton onClick={check} loading={busy} className="mt-3 w-full">
            {t("checkGuidance")} {picked.length > 0 ? `(${picked.length})` : ""}
          </PrimaryButton>
        </section>

        {/* Result */}
        {result && (
          <section role="status" className={`rounded-2xl border-4 p-4 ${LEVEL_UI[result.level].bg}`}>
            <h2 className={`text-xl font-black ${LEVEL_UI[result.level].text}`}>
              {LEVEL_UI[result.level].emoji} {t(LEVEL_UI[result.level].titleKey)}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{t(ADVICE_KEY[result.level])}</p>
            {result.level === "red" ? (
              <a href="tel:112" className="mt-3 block rounded-xl bg-danger px-4 py-4 text-center text-2xl font-black text-white">
                {t("call112Now")}
              </a>
            ) : (
              <Link href="/doctors" className="mt-3 block rounded-xl bg-sage-600 px-4 py-3 text-center font-black text-white">
                {t("findDoctorNear")}
              </Link>
            )}
            <AudioButton text={t(ADVICE_KEY[result.level])} label={t("hearIt")} />
            <p className="mt-2 text-[11px] text-ink/60">{t("elderColorNote")}</p>
          </section>
        )}

        {/* History */}
        {loading ? (
          <PageSpinner />
        ) : history.length > 0 && (
          <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
            <h2 className="mb-2 font-extrabold">{t("recentChecks")}</h2>
            <ul className="space-y-1.5">
              {history.slice(0, 8).map((h) => (
                <li key={h.id} className="flex items-center gap-2 rounded-lg bg-sage-50 px-3 py-1.5 text-xs">
                  <span>{h.level === "red" ? "🔴" : h.level === "yellow" ? "🟡" : "🟢"}</span>
                  {new Date(h.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  <span className="text-ink/50">· {h.symptoms.length} {t("symptomsNotedWord")}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Routine check-ups */}
        <section className="rounded-2xl border-2 border-rose-200 bg-white p-4">
          <h2 className="mb-2 flex items-center justify-between font-extrabold">
            {t("checkupTitle")}
            <AudioButton text={CHECKUP_KEYS.map((k) => t(k)).join(" ")} label={t("hearIt")} />
          </h2>
          <ul className="space-y-2 text-sm">
            {CHECKUP_KEYS.map((k) => (
              <li key={k} className="rounded-xl bg-rose-50 px-3 py-2">
                {t(k)}
              </li>
            ))}
          </ul>
        </section>

        <Banner kind="info" text={t("elderBanner")} />
      </div>
    </Guard>
  );
}
