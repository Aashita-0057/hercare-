"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AudioButton from "@/components/AudioButton";
import { Banner } from "@/components/ui";

// Titles/bodies come from psec* translation keys; emoji stays here.
const SECTIONS = [
  { emoji: "📥", k: "psec1" },
  { emoji: "🔑", k: "psec2" },
  { emoji: "📵", k: "psec3" },
  { emoji: "🤖", k: "psec4" },
  { emoji: "🔒", k: "psec5" },
  { emoji: "🚪", k: "psec6" },
  { emoji: "🗂", k: "psec7" },
  { emoji: "🗑", k: "psec8" },
  { emoji: "🧪", k: "psec9" },
];

export default function PrivacyPage() {
  const { t } = useI18n();
  const allAudio = SECTIONS.map((s) => `${t(`${s.k}t`)}. ${t(`${s.k}b`)}`).join(" ");

  return (
    <div className="space-y-4">
      <Link href="/profile" className="text-sm font-bold text-sage-700">← {t("profile")}</Link>
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-extrabold">🔐 {t("privacyTitle")}</h1>
        <AudioButton text={allAudio} label={t("hearPrivacyNotes")} />
      </div>

      <Banner kind="info" text={t("privPlainIntro")} />

      {SECTIONS.map((s) => (
        <section key={s.k} className="rounded-2xl border-2 border-sage-200 bg-white p-4">
          <h2 className="mb-1 flex items-center gap-2 font-extrabold">
            <span className="text-2xl" aria-hidden>{s.emoji}</span> {t(`${s.k}t`)}
          </h2>
          <p className="text-sm leading-relaxed text-ink/80">{t(`${s.k}b`)}</p>
        </section>
      ))}

      <p className="text-center text-[11px] text-ink/50">{t("privDpdpNote")}</p>
    </div>
  );
}
