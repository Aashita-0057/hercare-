"use client";

import { useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { BigCard } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <Guard>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold">💗 {t("dashboardTitle")}</h1>
          <AudioButton
            text={`${t("dashboardTitle")}. ${t("whatHappened")} ${t("periodsCard")}. ${t("pregnancyCard")}. ${t("elderCard")}.`}
            label={t("hearOptionsBtn")}
          />
        </div>

        <p className="rounded-xl bg-rose-50 p-3 text-xs leading-relaxed text-ink/70">{t("dashPrivacyNote")}</p>

        <div className="grid gap-4">
          <BigCard
            href="/dashboard/periods"
            emoji="🌸"
            tone="rose"
            title={t("periodsCard")}
            subtitle={t("periodsCardSub")}
          />
          <BigCard
            href="/dashboard/pregnancy"
            emoji="🤰"
            tone="sage"
            title={t("pregnancyCard")}
            subtitle={t("pregnancyCardSub")}
          />
          <BigCard
            href="/dashboard/elder"
            emoji="👵"
            tone="cream"
            title={t("elderCard")}
            subtitle={t("elderCardSub")}
          />
        </div>

        <p className="text-center text-xs text-ink/50">{t("dashToolsNote")}</p>
      </div>
    </Guard>
  );
}
