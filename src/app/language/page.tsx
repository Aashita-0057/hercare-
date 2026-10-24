"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import AudioButton from "@/components/AudioButton";
import { Check, Mic, Globe, ArrowLeft } from "lucide-react";

/**
 * Language switch section — choose between English and Kannada.
 * The choice applies instantly (UI, voice reader and assistant all follow it)
 * and is saved to this device + the account when logged in.
 */
export default function LanguagePage() {
  const { lang, setLanguage, t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  // If new translations didn't persist to localStorage before leaving, keep them anyway.
  useEffect(() => {
    localStorage.setItem("hc_lang", lang);
  }, [lang]);

  async function choose(code: string) {
    if (code === lang) return;
    setBusy(code);
    try {
      await setLanguage(code);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
          aria-label={t("back")}
        >
          <ArrowLeft size={18} /> {t("back")}
        </button>
        <AudioButton text={`${t("languageTitle")}. ${t("languageNote")}`} label={t("hearIt")} />
      </div>

      <div className="mb-6 rounded-3xl border-2 border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-600">
            <Globe size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-rose-600">{t("languageTitle")}</h1>
          <p className="mt-1 text-sm text-ink/70">{t("languageNote")}</p>
        </div>

        {/* Two big switch buttons */}
        <div className="grid gap-3 sm:grid-cols-2">
          {LANGUAGES.map((l) => {
            const isChosen = lang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => choose(l.code)}
                disabled={busy !== null}
                aria-pressed={isChosen}
                className={`flex items-center justify-between rounded-2xl border-2 p-5 text-left transition ${
                  isChosen
                    ? "border-rose-500 bg-rose-50 shadow-sm"
                    : "border-sage-200 bg-white hover:border-rose-200 hover:bg-cream"
                }`}
              >
                <div>
                  <div className="text-2xl font-extrabold text-ink">{l.native}</div>
                  <div className="mt-0.5 text-sm text-ink/60">{l.name}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {l.voice && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        <Mic size={10} /> {t("voiceSupport")}
                      </span>
                    )}
                    {l.uiTranslated && (
                      <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                        {t("voiceReadyBadge")}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                    isChosen ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {isChosen && <Check size={18} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {busy && (
          <p className="mt-3 text-center text-sm font-semibold text-rose-600">{t("loading")}</p>
        )}

        {/* Honest note about what switching changes */}
        <div className="mt-5 rounded-2xl border-2 border-sage-200 bg-sage-50 p-3.5 text-xs text-ink/80">
          <p className="font-bold text-sage-800">🎤 {t("languageTitle")}</p>
          <p className="mt-1">
            {t("contentFallbackNote")}
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="w-full rounded-2xl bg-rose-500 px-4 py-3.5 text-base font-extrabold text-white shadow hover:bg-rose-600"
          >
            {t("continue")} →
          </button>
        </div>
      </div>
    </div>
  );
}
