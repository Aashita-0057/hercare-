"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { Banner, PageSpinner, PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string | null;
  symptoms: string[];
  notes: string | null;
}

interface Prediction {
  averageCycleDays: number;
  nextStartEstimate: string;
  reliability: string;
  basedOnLogs: number;
}

const SYMPTOM_CHIPS = [
  { id: "cramps", key: "chipCramps" },
  { id: "heavy_flow", key: "chipHeavyFlow" },
  { id: "headache", key: "chipHeadache" },
  { id: "mood", key: "chipMood" },
  { id: "nausea", key: "chipNausea" },
  { id: "spotting", key: "chipSpotting" },
  { id: "tired", key: "chipTired" },
];

// Reliability strings produced by /api/periods → translation keys.
const RELIABILITY_KEY: Record<string, string> = {
  "fairly consistent": "relFairly",
  "somewhat variable": "relSomewhat",
  "very variable": "relVery",
};

export default function PeriodsPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  const [start, setStart] = useState("");
  const [today, setToday] = useState("");
  const [end, setEnd] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("/api/periods");
      setLogs(d.logs);
      setPrediction(d.prediction);
    } catch { /* offline — page still renders */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Dates are set client-side only — never evaluated during prerender.
  useEffect(() => {
    const iso = new Date().toISOString().slice(0, 10);
    setToday(iso);
    setStart(iso);
  }, []);

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      await api("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: start, endDate: end || undefined, symptoms: chips, notes }),
      });
      setChips([]); setNotes(""); setEnd("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api(`/api/periods?id=${id}`, { method: "DELETE" });
      await load();
    } catch { /* ignore */ }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const chipLabel = (s: string) => SYMPTOM_CHIPS.find((c) => c.id === s)?.key ? t(SYMPTOM_CHIPS.find((c) => c.id === s)!.key) : s;

  const hygieneTips = [t("hygiene1"), t("hygiene2"), t("hygiene3"), t("hygiene4")];

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/dashboard" className="text-sm font-bold text-sage-700">← {t("dashboard")}</Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold">🌸 {t("periodsCard")}</h1>
          <AudioButton text={t("periodsAudio")} label={t("hearIt")} />
        </div>

        <p className="text-sm text-ink/70">{t("periodsIntro")}</p>

        {/* Prediction — always labelled an estimate */}
        {!loading && (
          prediction ? (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-rose-500">{t("estimateHeading")}</p>
              <p className="mt-1 text-lg font-extrabold">
                {t("nextPeriodAround")} <span className="text-rose-600">{fmt(prediction.nextStartEstimate)}</span>
              </p>
              <p className="text-sm text-ink/70">
                {t("avgCycleLabel")} ≈ {prediction.averageCycleDays} {t("daysWord")} · {t(RELIABILITY_KEY[prediction.reliability] ?? "relSomewhat")} ·{" "}
                {t("basedOnLogs")} {prediction.basedOnLogs} {t("logsWord")}.
              </p>
              <p className="mt-2 text-xs text-ink/60">{t("estNotGuarantee")}</p>
              <AudioButton
                text={`${t("nextPeriodAround")} ${fmt(prediction.nextStartEstimate)}. ${t("estNotGuarantee")}`}
                label={t("hearIt")}
              />
            </div>
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-rose-200 bg-white p-4 text-sm text-ink/60">
              {t("needTwoLogs")}
            </p>
          )
        )}

        {/* Quick record */}
        <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
          <h2 className="mb-3 font-extrabold">{t("recordPeriod")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink/70">{t("startedOn")}</span>
              <input type="date" value={start} max={today || undefined}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border-2 border-sage-200 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink/70">{t("endedOn")}</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-xl border-2 border-sage-200 px-4 py-3" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SYMPTOM_CHIPS.map((c) => (
              <button key={c.id}
                onClick={() => setChips((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))}
                className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                  chips.includes(c.id) ? "border-rose-500 bg-rose-500 text-white" : "border-rose-200 bg-white"
                }`}>
                {t(c.key)}
              </button>
            ))}
          </div>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPh")}
            className="mt-3 w-full rounded-xl border-2 border-sage-200 px-4 py-3" />
          {error && <p role="alert" className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm font-bold text-danger">{error}</p>}
          <PrimaryButton onClick={save} loading={saving} className="mt-3 w-full">{t("saveRecord")}</PrimaryButton>
        </section>

        {/* History */}
        {loading ? (
          <PageSpinner />
        ) : logs.length > 0 ? (
          <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
            <h2 className="mb-2 font-extrabold">{t("recentRecords")}</h2>
            {logs.map((l) => (
              <div key={l.id} className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-rose-50 px-3 py-2">
                <div className="text-sm">
                  <b>{fmt(l.startDate)}</b>{l.endDate ? ` → ${fmt(l.endDate)}` : ` ${t("ongoing")}`}
                  {l.symptoms.length > 0 && <span className="block text-xs text-ink/60">{l.symptoms.map(chipLabel).join(" · ")}</span>}
                  {l.notes && <span className="block text-xs italic text-ink/50">&ldquo;{l.notes}&rdquo;</span>}
                </div>
                <button onClick={() => remove(l.id)} aria-label={t("delete")} title={t("delete")}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-danger hover:bg-danger/10">✕</button>
              </div>
            ))}
          </section>
        ) : (
          <p className="text-sm text-ink/60">{t("noRecordsYet")}</p>
        )}

        {/* Hygiene guidance */}
        <section className="rounded-2xl border-2 border-sage-300 bg-sage-50 p-4">
          <h2 className="mb-2 flex items-center justify-between font-extrabold">
            🧼 {t("hygieneTitle")}
            <AudioButton text={hygieneTips.join(" ")} label={t("hearGuide")} />
          </h2>
          <ul className="list-disc space-y-2 ps-5 text-sm text-ink/80">
            {hygieneTips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </section>

        <Banner kind="info" text={t("periodsBanner")} />
      </div>
    </Guard>
  );
}
