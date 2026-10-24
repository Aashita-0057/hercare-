"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import AudioButton from "@/components/AudioButton";
import { Banner, PageSpinner } from "@/components/ui";

interface Story {
  id: string;
  title: string;
  content: string;
  pseudonym: string;
  isIllustrative: boolean;
  consentOnFile: boolean;
}

export default function StoriesPage() {
  const { t } = useI18n();
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    api("/api/stories").then((d) => setStories(d.stories)).catch(() => setStories([]));
  }, []);

  if (!stories) return <PageSpinner />;

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/journal" className="text-sm font-bold text-sage-700">← {t("myJournal")}</Link>
        <h1 className="text-2xl font-extrabold">📖 Recovery stories</h1>
        <Banner
          kind="info"
          text={
            stories.some((s) => s.isIllustrative)
              ? "Demo build notice: the stories below are ILLUSTRATIVE examples written for this prototype, clearly marked. Real testimonies are published only with written consent, and never with identifying details."
              : "Shared with written consent; names changed."
          }
        />
        {stories.map((s) => (
          <article key={s.id} className="rounded-2xl border-2 border-sage-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-extrabold">&ldquo;{s.title}&rdquo;</h2>
              <AudioButton text={`${s.title}. ${s.content}`} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{s.content}</p>
            <p className="mt-2 text-xs font-bold text-sage-700">
              — {s.pseudonym}
              {s.isIllustrative && <span className="ms-2 rounded bg-caution/20 px-1.5 py-0.5 text-caution">illustrative example</span>}
              {s.consentOnFile && !s.isIllustrative && <span className="ms-2 text-[10px] text-ink/50">consent on file</span>}
            </p>
          </article>
        ))}
        <p className="text-center text-xs text-ink/50">
          Lapses are part of recovery. None of these women are &ldquo;inspired&rdquo; because they suffered — they
          got help, and so can you.
        </p>
      </div>
    </Guard>
  );
}
