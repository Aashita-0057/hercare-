"use client";

import { useI18n } from "@/lib/i18n";

export default function OfflineBar() {
  const { online, t } = useI18n();
  if (online) return null;
  return (
    <div role="status" className="bg-caution px-4 py-1.5 text-center text-xs font-bold text-white">
      📡 {t("offline")} — live search and AI need the internet; information saved on this device still opens.
    </div>
  );
}
