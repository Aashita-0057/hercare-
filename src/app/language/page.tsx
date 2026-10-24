"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES, LanguageDef } from "@/lib/languages";
import { PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";
import { Check, Mic, Globe, Search, ArrowLeft } from "lucide-react";

export default function LanguagePage() {
  const { lang, setLanguage, t } = useI18n();
  const router = useRouter();
  const [selected, setSelected] = useState<string>(lang || "en");
  const [search, setSearch] = useState("");
  const [dialect, setDialect] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    setBusy(true);
    try {
      await setLanguage(selected);
      router.push("/home");
    } finally {
      setBusy(false);
    }
  }

  const selectedDef = LANGUAGES.find((l) => l.code === selected);
  const audioText = `${t("languageTitle")}. ${t("languageNote")} 22 भारतीय भाषाओं और अंग्रेजी में उपलब्ध है।`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
          aria-label={t("back")}
        >
          <ArrowLeft size={18} /> {t("back")}
        </button>
        <AudioButton text={audioText} label={t("hearIt")} />
      </div>

      <div className="mb-6 rounded-3xl border-2 border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-600">
            <Globe size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-rose-600">{t("languageTitle")}</h1>
          <p className="mt-1 text-sm text-ink/70">{t("languageNote")}</p>
        </div>

        {/* Honest Disclosure Banner */}
        <div className="mb-5 rounded-2xl border-2 border-sage-200 bg-sage-50 p-3.5 text-xs text-ink/80">
          <p className="font-bold text-sage-800">
            🇮🇳 22 Constitutionally Scheduled Indian Languages + English
          </p>
          <p className="mt-1">
            Languages with the <span className="inline-flex items-center gap-0.5 font-bold text-rose-600"><Mic size={12} /> Voice</span> badge support Web Speech API (speaking & speech recognition in Chrome/Edge). English and Hindi have complete verified UI translations; core regional translations and article speech assistance apply across all.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3.5 top-3.5 text-ink/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t("searchLanguages")} (e.g. Hindi, বাংলা, தமிழ், Urdu)…`}
            className="w-full rounded-2xl border-2 border-sage-200 bg-white py-3 pl-10 pr-4 text-base outline-none focus:border-rose-400"
          />
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-[420px] overflow-y-auto p-1">
          {filtered.map((l: LanguageDef) => {
            const isChosen = selected === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelected(l.code)}
                className={`flex items-center justify-between rounded-2xl border-2 p-3.5 text-left transition ${
                  isChosen
                    ? "border-rose-500 bg-rose-50 shadow-sm"
                    : "border-sage-200 bg-white hover:border-rose-200 hover:bg-cream"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-ink">{l.native}</span>
                    <span className="text-xs text-ink/60">({l.name})</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {l.voice && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        <Mic size={10} /> Voice
                      </span>
                    )}
                    {l.rtl && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        RTL
                      </span>
                    )}
                    {l.uiTranslated ? (
                      <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                        UI Translated
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        Speech Assist
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
                    isChosen
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChosen && <Check size={16} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional regional dialect note */}
        <div className="mt-4 pt-3 border-t border-rose-100">
          <label className="block text-xs font-semibold text-ink/70 mb-1">
            Regional dialect or local variation (optional):
          </label>
          <input
            type="text"
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            placeholder="e.g. Bhojpuri, Awadhi, Marwari, Sylheti, Malabar…"
            className="w-full rounded-xl border border-sage-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
          />
          <p className="mt-1 text-[11px] text-ink/50">
            Saved in your profile to help match regional healthcare workers where supported.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <PrimaryButton onClick={handleSave} loading={busy}>
            {t("save")} & {t("continue")} ({selectedDef?.native || "Continue"}) →
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
