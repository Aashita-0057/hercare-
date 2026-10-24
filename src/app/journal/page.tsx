"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

type DayStatus = "sober" | "difficult";
interface Day {
  id: string;
  date: string;
  status: DayStatus;
  note: string | null;
}
interface Craving {
  id: string;
  icon: string;
  level: number;
  note: string | null;
  createdAt: string;
}

// Daily affirmation is picked by date and translated at render via affirm* keys.
const AFFIRM_KEYS = ["affirm1", "affirm2", "affirm3", "affirm4", "affirm5", "affirm6"];

const CRAVING_ICONS = [
  { id: "cravings", emoji: "🔥", k: "craviCravings" },
  { id: "anxiety", emoji: "😰", k: "craviAnxiety" },
  { id: "headache", emoji: "🤕", k: "craviHeadache" },
  { id: "bodypain", emoji: "🦴", k: "craviBodypain" },
  { id: "sleep", emoji: "🌙", k: "craviSleep" },
  { id: "mood", emoji: "🎭", k: "craviMood" },
  { id: "other", emoji: "❓", k: "craviOther" },
];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function JournalPage() {
  const { t } = useI18n();
  const [stage, setStage] = useState<"check" | "setup" | "unlock" | "open">("check");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [days, setDays] = useState<Day[]>([]);
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [spend, setSpend] = useState<number>(0);
  const [spendInput, setSpendInput] = useState("");
  const [week, setWeek] = useState(7);
  const [note, setNote] = useState("");
  const [sos, setSos] = useState(false);
  const [affirmIdx] = useState(() => new Date().getDate() % AFFIRM_KEYS.length);
  // Captured once after mount — render stays pure (no Date.now() during render).
  const [nowMs, setNowMs] = useState(0);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    api("/api/journal/pin")
      .then((d) => setStage(d.hasPin ? "unlock" : "setup"))
      .catch(() => setStage("setup"));
  }, []);

  const load = useCallback(async () => {
    try {
      const d = await api("/api/journal/entries");
      setDays(d.days);
      setCravings(d.cravings);
      setSpend(Number(d.previousDailySpend) || 0);
      setStage("open");
      // Auto-lock after 2 minutes of inactivity (client-side UX layer).
      if (lockTimer.current) clearTimeout(lockTimer.current);
      lockTimer.current = setTimeout(() => setStage("unlock"), 120_000);
    } catch {
      setStage("unlock"); // session expired → back to PIN
    }
  }, []);

  useEffect(() => {
    if (stage === "open") load();
    return () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, [stage, load]);

  async function submitPin() {
    if (!/^\d{4}$/.test(pin)) {
      setError(t("jnlPinDigits"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/api/journal/pin", { method: "POST", body: JSON.stringify({ pin }) });
      setPin("");
      setStage("open");
    } catch (err) {
      setError((err as Error).message || t("journalWrongPin"));
    } finally {
      setBusy(false);
    }
  }

  async function markToday(status: DayStatus) {
    const today = new Date();
    try {
      await api("/api/journal/entries", {
        method: "POST",
        body: JSON.stringify({ op: "day", date: today.toISOString(), status, note: note || undefined }),
      });
      setNote("");
      load();
    } catch { /* stays */ }
  }

  async function logCraving(icon: string) {
    try {
      await api("/api/journal/entries", { method: "POST", body: JSON.stringify({ op: "craving", icon, level: 3 }) });
      load();
    } catch { /* stays */ }
  }

  async function saveSpend() {
    try {
      await api("/api/journal/entries", {
        method: "POST",
        body: JSON.stringify({ op: "spend", previousDailySpend: Number(spendInput) || 0 }),
      });
      load();
    } catch { /* stays */ }
  }

  // Savings math: sober days × previous daily spend.
  const soberCount = days.filter((d) => d.status === "sober").length;
  const recentSober = days
    .filter((d) => d.status === "sober" && nowMs - new Date(d.date).getTime() < week * 86400_000)
    .length;
  const saved = Math.round(recentSober * spend);

  const monthCells = () => {
    const now = new Date();
    const firstWeekday = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const cells: { blank: boolean; date: Date | null; day: Day | null }[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ blank: true, date: null, day: null });
    for (let d = 1; d <= now.getDate(); d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const found = days.find((x) => sameDay(new Date(x.date), date)) || null;
      cells.push({ blank: false, date, day: found });
    }
    return cells;
  };

  return (
    <Guard>
      {stage === "check" && null}

      {(stage === "setup" || stage === "unlock") && (
        <div className="mx-auto max-w-sm space-y-4 py-10">
          <div className="rounded-3xl border-2 border-sage-200 bg-white p-6 text-center">
            <p className="mb-1 text-4xl">🌱</p>
            <h1 className="text-xl font-extrabold">{t("myJournal")}</h1>
            <p className="mb-4 mt-1 text-sm text-ink/60">
              {stage === "setup" ? t("journalPinSet") : t("journalPinTitle")}
            </p>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              type="password"
              aria-label={t("journalPinTitle")}
              className="mb-3 w-full rounded-xl border-2 border-sage-200 py-3 text-center text-3xl tracking-[0.5em]"
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
            />
            {error && <p role="alert" className="mb-2 text-sm font-bold text-danger">{error}</p>}
            <PrimaryButton tone="sage" onClick={submitPin} loading={busy}>
              {stage === "setup" ? t("createPin") : t("unlockWord")}
            </PrimaryButton>
            <p className="mt-4 text-[11px] leading-relaxed text-ink/50">
              🔒 {t("pinLockNotice")} {t("jnlPinServerNote")}
            </p>
            <p className="mt-2 text-[11px] text-ink/50">{t("quickExitWarn")}</p>
          </div>
        </div>
      )}

      {stage === "open" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold">🌱 {t("myJournal")}</h1>
            <Link href="/neutral" className="text-sm font-bold text-ink/50 underline">
              {t("quickExit")}
            </Link>
          </div>

          {/* B. Recovery calendar */}
          <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
            <h2 className="mb-2 font-extrabold">{t("recovCalendar")}</h2>
            <div className="grid grid-cols-7 gap-1.5 text-center text-sm">
              {t("dayLetters").split(",").map((d, i) => (
                <span key={i} className="text-[11px] font-bold text-ink/40">{d}</span>
              ))}
              {monthCells().map((c, i) =>
                c.blank ? (
                  <span key={i} />
                ) : (
                  <div
                    key={i}
                    title={c.day ? (c.day.status === "sober" ? t("goodDay") : t("difficultDayMark")) : `${c.date?.getDate()} — ${t("notMarked")}`}
                    className="aspect-square rounded-lg pt-1 text-lg"
                  >
                    {c.day ? (c.day.status === "sober" ? "🍃" : "🪨") : <span className="text-[11px] text-ink/30">{c.date?.getDate()}</span>}
                  </div>
                )
              )}
            </div>
            <p className="mt-2 text-xs text-ink/60">
              {t("streakLine")} <b>{soberCount}</b> {t("goodDaysRecorded")} · {days.filter((d) => d.status === "difficult").length} {t("difficultDaysPart")}
            </p>
            <div className="mt-3 space-y-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("todayNotePh")}
                className="w-full rounded-xl border border-sage-200 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => markToday("sober")} className="rounded-xl bg-sage-600 py-3 font-extrabold text-white hover:bg-sage-700">
                  🍃 {t("soberDay")}
                </button>
                <button onClick={() => markToday("difficult")} className="rounded-xl bg-stone-300 py-3 font-extrabold text-stone-700 hover:bg-stone-400">
                  🪨 {t("difficultDay")}
                </button>
              </div>
            </div>
          </section>

          {/* C. Craving & symptom tracker */}
          <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
            <h2 className="mb-1 font-extrabold">{t("bodyFeelNow")}</h2>
            <p className="mb-3 text-xs text-ink/60">{t("tapWhatFeel")}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {CRAVING_ICONS.map((c) => (
                <button key={c.id} onClick={() => logCraving(c.id)} className="rounded-xl border-2 border-sage-100 py-3 text-center hover:border-rose-300">
                  <span className="block text-2xl">{c.emoji}</span>
                  <span className="text-[10px] font-bold">{t(c.k)}</span>
                </button>
              ))}
            </div>
            {cravings.length > 0 && (
              <p className="mt-3 text-xs text-ink/60">
                {t("last7Days")} {cravings.filter((c) => nowMs - new Date(c.createdAt).getTime() < 7 * 86400_000).length} {t("entriesLoggedWord")}
              </p>
            )}
          </section>

          {/* D. Savings calculator */}
          <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
            <h2 className="mb-2 font-extrabold">💰 {t("savingsCalculator")}</h2>
            <div className="flex gap-2">
              <input
                value={spendInput}
                onChange={(e) => setSpendInput(e.target.value.replace(/\D/g, ""))}
                placeholder={t("spendPerDayPh")}
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-xl border-2 border-sage-200 px-3 py-2.5 text-sm"
              />
              <button onClick={saveSpend} className="rounded-xl bg-sage-600 px-4 text-sm font-bold text-white">
                {t("save")}
              </button>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              {[7, 14, 30].map((wv) => (
                <button key={wv} onClick={() => setWeek(wv)} className={`rounded-full px-3 py-1 font-bold ${week === wv ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"}`}>
                  {wv === 7 ? t("thisWeekBtn") : wv === 14 ? t("twoWeeksBtn") : t("monthBtn")}
                </button>
              ))}
            </div>
            {spend > 0 ? (
              <p className="mt-3 rounded-xl bg-sage-50 p-3 text-center text-lg font-extrabold text-sage-700">
                {t("mayHaveSaved")} ₹{saved.toLocaleString("en-IN")} {week === 7 ? t("savedWeekSuffix") : `${week} ${t("savedDaysSuffix")}`}
                <span className="block text-xs font-semibold text-ink/60">
                  {t("savedEstimate")} {recentSober} {t("savedEstimate2")}{spend}{t("savedEstimate3")}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-xs text-ink/50">{t("enterSpendFirst")}</p>
            )}
          </section>

          {/* E. Daily affirmation */}
          <section className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-center">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-500">{t("todayStrength")}</h2>
            <p className="text-lg font-extrabold text-rose-700">&ldquo;{t(AFFIRM_KEYS[affirmIdx])}&rdquo;</p>
            <div className="mt-2 flex justify-center">
              <AudioButton text={t(AFFIRM_KEYS[affirmIdx])} label={t("hearIt")} />
            </div>
            <p className="mt-1 text-[10px] text-ink/40">{t("affirmAudioNote")}</p>
          </section>

          {/* H. Emergency craving SOS */}
          <button onClick={() => setSos(true)} className="w-full rounded-2xl bg-danger py-4 text-xl font-black text-white shadow-lg hover:bg-danger-dark">
            🆘 {t("emergencySos")}
          </button>

          {/* F, G, I links */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link href="/journal/stories" className="rounded-xl border-2 border-sage-200 bg-white p-3 text-center text-sm font-bold">
              {t("storiesLink")}
            </Link>
            <Link href="/journal/guide" className="rounded-xl border-2 border-sage-200 bg-white p-3 text-center text-sm font-bold">
              {t("guideLink")}
            </Link>
            <Link href="/journal/directory" className="rounded-xl border-2 border-sage-200 bg-white p-3 text-center text-sm font-bold">
              {t("dirLink")}
            </Link>
          </div>

          {/* SOS modal */}
          {sos && (
            <div role="dialog" aria-label={t("emergencySos")} className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4">
              <div className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5">
                <h2 className="text-xl font-black text-danger">{t("waveTitle")}</h2>
                <p className="text-sm">{t("wavePass")}</p>
                <AudioButton text={t("groundingAudio")} label={t("groundingPlay")} />
                <p className="rounded-xl bg-sage-50 p-3 text-xs">
                  {t("humanVoiceNote")}
                </p>
                <p className="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">
                  {t("urgentHarmNote")}
                </p>
                <a href="tel:112" className="block rounded-xl bg-danger py-3 text-center font-black text-white">
                  {t("callEmergency")} (112)
                </a>
                <button onClick={() => setSos(false)} className="w-full rounded-xl border-2 border-sage-200 py-3 font-bold">
                  {t("back")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Guard>
  );
}
