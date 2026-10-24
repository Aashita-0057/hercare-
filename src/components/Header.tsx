"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LANG_MAP } from "@/lib/languages";
import VoiceSearch from "./VoiceSearch";
import { Sparkles, Globe } from "lucide-react";

export default function Header({ onOpenAssistant }: { onOpenAssistant: () => void }) {
  const { t, lang } = useI18n();
  const currentLang = LANG_MAP[lang] || { native: "EN", name: "English" };

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100 bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
        <Link href="/home" className="flex items-center gap-1.5 shrink-0" aria-label="HerCare+ home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-500 text-white text-lg font-bold shadow-sm" aria-hidden>
            ❤
          </span>
          <span className="hidden sm:block text-lg font-extrabold text-rose-600">HerCare+</span>
        </Link>

        {/* Language selector in header */}
        <Link
          href="/language"
          className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shrink-0"
          aria-label={t("languageTitle")}
          title={t("languageTitle")}
        >
          <Globe size={15} className="text-rose-600" />
          <span>{currentLang.native}</span>
        </Link>

        <div className="mx-auto flex-1 min-w-0 max-w-sm">
          <VoiceSearch />
        </div>

        {/* AI assistant — high-contrast, labelled, top-right */}
        <button
          onClick={onOpenAssistant}
          className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full bg-sage-600 text-white border-2 border-sage-700 shadow hover:bg-sage-700 transition"
          aria-label={t("aiAssistant")}
          title={t("aiAssistant")}
        >
          <Sparkles size={20} aria-hidden />
        </button>
      </div>
    </header>
  );
}
