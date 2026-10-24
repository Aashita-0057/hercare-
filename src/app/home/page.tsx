"use client";

import { useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { BigCard } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

export default function HomePage() {
  const { user, t, lang } = useI18n();

  const welcome = t("homeWelcome").replace("{name}", user?.name || "");

  return (
    <Guard>
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
          <p className="text-lg font-bold">
            🙏 {t("welcomeTo")}<br />
            <span className="text-sm font-semibold text-sage-700">{t("tagline")}</span>
          </p>
          <div className="mt-2 flex justify-center">
            <AudioButton text={welcome} label={t("hearStartSteps")} />
          </div>
        </div>

        {/* BLOCK 1: About the App */}
        <BigCard
          href="/about"
          emoji="ℹ️"
          tone="rose"
          title={t("aboutBlock")}
          subtitle={t("aboutSub")}
        />

        {/* BLOCK 2: Awareness */}
        <BigCard
          href="/awareness"
          emoji="📚"
          tone="rose"
          title={t("awarenessBlock")}
          subtitle={t("awarenessSub")}
        />

        {/* BLOCK 3: Find Your Doctor — the primary feature, visually loudest */}
        <BigCard
          href="/doctors"
          emoji="🩺"
          tone="sage"
          title={`⭐ ${t("doctorBlock")}`}
          subtitle={t("doctorSub")}
        />

        {/* BLOCK 4: discreet public label — Daily Wellness Journal */}
        <BigCard
          href="/journal"
          emoji="🌱"
          tone="plum"
          title={t("myJournal")}
          subtitle={t("journalDiscreetSub")}
        />

        {/* BLOCK 5: Care and Protect Yourself */}
        <BigCard
          href="/safety"
          emoji="🛡"
          tone="rosedeep"
          title={t("careBlock")}
          subtitle={t("careSub")}
        />

        {/* quick hop to the personal dashboard (also in bottom nav) */}
        <BigCard
          href="/dashboard"
          emoji="🌸"
          tone="cream"
          title={t("dashboardTitle")}
          subtitle={`${t("periodsCardSub")} · ${t("pregnancyCardSub")} · ${t("elderCardSub")}`}
        />

        <p className="pt-2 text-center text-xs text-ink/50" lang={lang}>
          {t("sampleDataBanner")}
        </p>
      </div>
    </Guard>
  );
}
