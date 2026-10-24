"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { PageSpinner } from "@/components/ui";

const CATS = [
  { id: "", label: "All topics", emoji: "🌈" },
  { id: "lifecycle", label: "A. Lifecycle Care", emoji: "🌙" },
  { id: "preventive", label: "B. Preventative Health", emoji: "🛡" },
  { id: "wellness", label: "C. General Wellness", emoji: "🌿" },
  { id: "myths", label: "D. Myth-Busters", emoji: "❌" },
];

interface Card {
  slug: string;
  category: string;
  icon: string;
  title: string;
  summary: string;
  englishFallback: boolean;
}

function AwarenessInner() {
  const { t, lang } = useI18n();
  const sp = useSearchParams();
  const [cat, setCat] = useState("");
  const [q, setQ] = useState(sp.get("q") || "");
  const [articles, setArticles] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ lang });
    if (cat) qs.set("category", cat);
    if (q) qs.set("q", q);
    api(`/api/articles?${qs}`)
      .then((d) => setArticles(d.articles))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [cat, q, lang]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-rose-600">📚 {t("awarenessBlock")}</h1>
        <p className="text-sm text-ink/70">{t("awarenessSub")} — every article has a 🔊 button and tells you when to see a health worker.</p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`${t("search")} topics… (e.g. anemia, periods, menopause)`}
        aria-label={t("search")}
        className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-2.5"
      />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {CATS.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full border-2 px-3.5 py-2 text-xs font-bold ${
              cat === c.id ? "border-rose-500 bg-rose-500 text-white" : "border-sage-200 bg-white hover:bg-rose-50"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : articles.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center font-semibold text-ink/60">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/awareness/${a.slug}`}
              className="rounded-2xl border-2 border-sage-200 bg-white p-4 hover:border-rose-300 hover:bg-rose-50"
            >
              <div className="mb-1 text-3xl" aria-hidden>
                {a.icon}
              </div>
              <h2 className="font-extrabold leading-snug">{a.title}</h2>
              <p className="mt-1 text-sm text-ink/70">{a.summary}</p>
              {a.englishFallback && (
                <p className="mt-2 text-[11px] font-semibold text-caution">
                  ⚠ Translation in {lang} is being reviewed — showing English for accuracy.
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AwarenessPage() {
  return (
    <Guard>
      <Suspense fallback={<PageSpinner />}>
        <AwarenessInner />
      </Suspense>
    </Guard>
  );
}
