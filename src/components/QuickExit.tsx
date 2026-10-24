"use client";

import { useI18n } from "@/lib/i18n";

/**
 * Persistent panic/quick-exit control shown on sensitive pages.
 * One tap → neutral weather page, no confirmation dialog.
 * Honest note: this does NOT erase browser history or guarantee invisibility.
 */
export default function QuickExit() {
  const { t } = useI18n();

  const exit = () => {
    // Full replace navigation — back-button should not bounce straight back.
    window.location.replace("/neutral");
  };

  return (
    <button
      onClick={exit}
      title={`${t("quickExit")} — ${t("quickExitNote")}`}
      aria-label={t("quickExit")}
      className="fixed bottom-20 end-3 z-50 flex items-center gap-1.5 rounded-full border-2 border-ink/20 bg-white px-4 py-2 text-sm font-bold text-ink shadow-lg hover:bg-rose-50"
    >
      🌤 {t("quickExit")}
    </button>
  );
}
