"use client";

import { useI18n } from "@/lib/i18n";
import { Volume2, Square } from "lucide-react";

/** 🔊 Listen button — TTS in the selected language, text always stays visible. */
export default function AudioButton({ text, label }: { text: string; label?: string }) {
  const { speak, stopSpeak, speaking, spokenText, t } = useI18n();
  const active = speaking && spokenText === text;
  return (
    <button
      type="button"
      onClick={active ? stopSpeak : () => speak(text)}
      className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50 px-3 py-1.5 text-sm font-semibold text-sage-700 hover:bg-sage-100"
      aria-label={label || t("hearIt")}
    >
      {active ? <Square size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}
      {active ? t("stopAudio") : label || t("hearIt")}
    </button>
  );
}
