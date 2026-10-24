"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { BigCard } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

export default function ProfilePage() {
  const { t, user, logout } = useI18n();
  const [leaving, setLeaving] = useState(false);

  const maskPhone = (p: string) => p.replace(/^(\d{2})\d{4}(\d{4})$/, "$1••••$2");

  const doLogout = async () => {
    setLeaving(true);
    await logout();
  };

  return (
    <Guard>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold">👤 {t("profile")}</h1>
          <AudioButton text={t("profAudioIntro")} label={t("hearIt")} />
        </div>

        <section className="rounded-2xl border-2 border-rose-200 bg-white p-4">
          <p className="text-lg font-extrabold">{user?.name}</p>
          <p className="text-sm text-ink/60">📱 {user?.phone ? maskPhone(user.phone) : "—"}</p>
          <p className="mt-1 text-xs text-ink/50">{t("noEmailStored")}</p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <BigCard href="/language" emoji="🌐" tone="rose" title={t("languageTitle")} subtitle={t("languageNote")} />
          <BigCard href="/profile/saved" emoji="⭐" tone="rose" title={t("savedDoctorsTitle")} subtitle={t("savedDoctorsSub")} />
          <BigCard href="/journal" emoji="📔" tone="sage" title={t("myJournal")} subtitle={t("journalPinSub")} />
          <BigCard href="/profile/privacy" emoji="🔐" tone="cream" title={t("privacyTitle")} subtitle={t("privacySub")} />
          <BigCard href="/about" emoji="ℹ️" tone="plum" title={t("aboutBlock")} subtitle={t("aboutSub")} />
        </div>

        <section className="rounded-2xl border-2 border-sage-200 bg-white p-4 text-sm">
          <h2 className="font-extrabold">{t("yourDataHonest")}</h2>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-ink/70">
            <li>{t("pd1")}</li>
            <li>{t("pd2")}</li>
            <li>{t("pd3")}</li>
            <li>{t("pd4")}</li>
          </ul>
        </section>

        <button
          onClick={doLogout}
          disabled={leaving}
          className="w-full rounded-2xl border-2 border-danger px-4 py-3.5 font-extrabold text-danger hover:bg-danger/5"
        >
          {leaving ? "…" : `🚪 ${t("logout")}`}
        </button>
        <p className="text-center text-[11px] text-ink/50">{t("logoutClearsNote")}</p>
      </div>
    </Guard>
  );
}
