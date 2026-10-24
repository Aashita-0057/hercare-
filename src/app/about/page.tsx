"use client";

import { useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import AudioButton from "@/components/AudioButton";
import Link from "next/link";

const STEPS = [
  { emoji: "📱", k: "aboutStep1" },
  { emoji: "🗣", k: "aboutStep2" },
  { emoji: "🎤", k: "aboutStep3" },
  { emoji: "🩺", k: "aboutStep4" },
  { emoji: "📚", k: "aboutStep5" },
  { emoji: "🌸", k: "aboutStep6" },
  { emoji: "🌱", k: "aboutStep7" },
  { emoji: "🛡", k: "aboutStep8" },
];

export default function AboutPage() {
  const { t } = useI18n();
  const audio = STEPS.map((s) => `${t(`${s.k}t`)}. ${t(`${s.k}b`)}`).join(" ");

  return (
    <Guard>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-rose-600">ℹ️ {t("aboutBlock")}</h1>
            <p className="text-sm text-ink/70">{t("aboutSub")}</p>
          </div>
          <AudioButton text={audio} label={t("hearAllStepsBtn")} />
        </div>

        {STEPS.map((s) => (
          <div key={s.k} className="flex gap-3 rounded-2xl border-2 border-sage-200 bg-white p-4">
            <span className="text-4xl" aria-hidden>
              {s.emoji}
            </span>
            <div>
              <h2 className="font-extrabold">{t(`${s.k}t`)}</h2>
              <p className="text-sm text-ink/70">{t(`${s.k}b`)}</p>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-sm">
          <h2 className="font-extrabold text-rose-700">{t("aboutPrivacyOneLiner")}</h2>
          <p className="mt-1">{t("aboutPrivacyBody")}</p>
          <Link href="/profile/privacy" className="mt-2 inline-block font-bold text-rose-600 underline">
            {t("privacyTitle")} →
          </Link>
        </div>
      </div>
    </Guard>
  );
}
