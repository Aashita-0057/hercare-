"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import AudioButton from "@/components/AudioButton";

const SECTIONS = [
  { emoji: "💧", k: "guideHydration", danger: false },
  { emoji: "🧠", k: "guideMind", danger: false },
  { emoji: "😴", k: "guideSleep", danger: false },
  { emoji: "🚨", k: "guideDanger", danger: true },
  { emoji: "🏥", k: "guideHelp", danger: true },
];

export default function WithdrawalGuidePage() {
  const { t } = useI18n();
  const allAudio = SECTIONS.map((s) => `${t(`${s.k}T`)}. ${t(`${s.k}B`)}`).join(" ");

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/journal" className="text-sm font-bold text-sage-700">← {t("myJournal")}</Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold">{t("guideLink")}</h1>
          <AudioButton text={allAudio} label={t("hearGuideBtn")} />
        </div>

        {SECTIONS.map((s) => (
          <section
            key={s.k}
            className={`rounded-2xl border-2 p-4 ${s.danger ? "border-danger bg-danger/5" : "border-sage-200 bg-white"}`}
          >
            <h2 className={`mb-1 flex items-center gap-2 font-extrabold ${s.danger ? "text-danger" : ""}`}>
              <span className="text-2xl">{s.emoji}</span> {t(`${s.k}T`)}
            </h2>
            <p className="text-sm leading-relaxed text-ink/80">{t(`${s.k}B`)}</p>
          </section>
        ))}

        <p className="rounded-xl bg-rose-50 p-3 text-xs text-ink/70">{t("guideNote")}</p>
      </div>
    </Guard>
  );
}
