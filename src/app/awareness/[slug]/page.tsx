"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import AudioButton from "@/components/AudioButton";
import { PageSpinner } from "@/components/ui";

interface ArticleData {
  article: { slug: string; category: string; icon: string };
  translation: { title: string; summary: string; body: string; whenToSeek: string | null; lang: string };
  englishFallback: boolean;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const [data, setData] = useState<ArticleData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/api/articles?slug=${slug}&lang=${lang}`)
      .then(setData)
      .catch(() => setMissing(true));
  }, [slug, lang]);

  if (missing)
    return (
      <div className="py-16 text-center">
        <p className="mb-4 font-bold">{t("noResults")}</p>
        <Link href="/awareness" className="rounded-xl bg-rose-500 px-5 py-2.5 font-bold text-white">
          {t("awarenessBlock")}
        </Link>
      </div>
    );

  if (!data) return <PageSpinner />;

  const tr = data.translation;
  const spoken = `${tr.title}. ${tr.body}`;

  return (
    <Guard>
      <article className="space-y-4">
        <Link href="/awareness" className="text-sm font-bold text-sage-700">
          ← {t("awarenessBlock")}
        </Link>

        <div className="rounded-3xl border-2 border-rose-100 bg-white p-5">
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className="text-5xl" aria-hidden>
              {data.article.icon}
            </span>
            <AudioButton text={spoken} />
          </div>
          <h1 className="text-2xl font-extrabold leading-snug">{tr.title}</h1>
          <p className="mt-1 text-ink/70">{tr.summary}</p>
          {data.englishFallback && (
            <p className="mt-2 rounded-lg bg-caution/10 px-3 py-1.5 text-xs font-semibold text-caution">
              ⚠ Reviewed translation in your language is on the way — this is the English original, kept
              unchanged so medical advice stays accurate.
            </p>
          )}

          <div className="mt-4 space-y-3 text-[16.5px] leading-relaxed">
            {tr.body.split("\n\n").map((para, i) => (
              <p key={i} className={/^##\s/.test(para) ? "text-lg font-extrabold text-sage-700" : ""}>
                {para.replace(/^##\s/, "")}
              </p>
            ))}
          </div>
        </div>

        {tr.whenToSeek && (
          <section className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
            <h2 className="mb-1 font-extrabold text-rose-700">🩺 {t("whenSeekHelp")}</h2>
            <p className="text-sm">{tr.whenToSeek}</p>
            <Link
              href="/doctors"
              className="mt-3 inline-block rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-extrabold text-white"
            >
              {t("findDoctor")} →
            </Link>
          </section>
        )}

        <p className="text-center text-[11px] text-ink/50">
          Educational content reviewed against government health guidance (NHM / HFA India). It does not replace a
          doctor&apos;s advice.
        </p>
      </article>
    </Guard>
  );
}
