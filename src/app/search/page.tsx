"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, useI18n } from "@/lib/i18n";
import FacilityCard from "@/components/FacilityCard";
import { PageSpinner } from "@/components/ui";
import type { FacilityDTO } from "@/app/api/doctors/route";

const PAGE_SHORTCUTS = [
  { href: "/home", title: "🏠 Home", match: "home dashboard start" },
  { href: "/doctors", title: "🔍 Find Your Doctor", match: "doctor hospital clinic find gyn gynecologist" },
  { href: "/awareness", title: "📚 Health awareness articles", match: "article awareness myth learn read anaemia anemia period menopause cancer" },
  { href: "/journal", title: "📔 Daily Wellness Journal", match: "journal addiction quit rehab craving alcohol smoking tobacco" },
  { href: "/safety", title: "🛡 Women's Safety & Support", match: "safety emergency helpline 112 181 harassment help protect" },
  { href: "/safety/report", title: "📝 Report harassment", match: "report complaint harassment abuse" },
  { href: "/safety/nearby", title: "📍 Nearby help centres", match: "nearby support centre ngo legal" },
  { href: "/dashboard", title: "💗 Health dashboard", match: "period pregnancy baby elder tracker cycle vaccine newborn" },
  { href: "/profile/privacy", title: "🔐 Privacy explanation", match: "privacy data delete storage secure" },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const [input, setInput] = useState(q);
  const [facilities, setFacilities] = useState<FacilityDTO[]>([]);
  const [articles, setArticles] = useState<{ slug: string; title: string; summary: string; icon: string }[]>([]);
  const [helplines, setHelplines] = useState<{ id: string; name: string; number: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFacilities([]); setArticles([]); setHelplines([]);
      return;
    }
    setLoading(true);
    const results = await Promise.allSettled([
      api(`/api/doctors?q=${encodeURIComponent(query)}`),
      api(`/api/articles?q=${encodeURIComponent(query)}&lang=${lang}`),
      api("/api/helplines"),
    ]);
    setFacilities(results[0].status === "fulfilled" ? results[0].value.facilities.slice(0, 8) : []);
    setArticles(results[1].status === "fulfilled" ? results[1].value.articles.slice(0, 8) : []);
    setHelplines(
      results[2].status === "fulfilled"
        ? (results[2].value.helplines as typeof helplines).filter((h) =>
            `${h.name} ${h.description} ${h.number}`.toLowerCase().includes(query.toLowerCase()),
          ).slice(0, 5)
        : [],
    );
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    setInput(q);
    run(q);
  }, [q, run]);

  const pages = q.trim()
    ? PAGE_SHORTCUTS.filter((p) => {
        const s = q.toLowerCase();
        return p.match.includes(s) || s.split(/\s+/).some((w) => p.match.includes(w) && w.length > 3);
      })
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">🔎 {t("search")}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(input)}`);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("searchHint")}
          aria-label={t("search")}
          className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 text-lg outline-none focus:border-rose-400"
        />
        <button className="shrink-0 rounded-xl bg-rose-500 px-5 py-3 font-extrabold text-white">{t("search")}</button>
      </form>
      <p className="text-xs text-ink/50">
        Searches doctor records, awareness articles and helplines together. Voice works too — tap the 🎤 in the header.
      </p>

      {loading && <PageSpinner />}

      {!loading && !q.trim() && (
        <p className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center font-semibold text-ink/60">
          Type or speak something above — for example &ldquo;gynecologist ward&rdquo;, &ldquo;anemia&rdquo;,
          &ldquo;quit smoking&rdquo;, &ldquo;181&rdquo;.
        </p>
      )}

      {pages.length > 0 && (
        <section>
          <h2 className="mb-2 font-extrabold">Pages</h2>
          {pages.map((p) => (
            <Link key={p.href} href={p.href} className="mb-2 block rounded-xl border-2 border-sage-200 bg-white px-4 py-3 font-bold hover:bg-sage-50">
              {p.title}
            </Link>
          ))}
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="mb-2 font-extrabold">📚 Awareness articles</h2>
          {articles.map((a) => (
            <Link key={a.slug} href={`/awareness/${a.slug}`} className="mb-2 block rounded-xl border-2 border-rose-200 bg-white p-4 hover:bg-rose-50">
              <b>{a.icon} {a.title}</b>
              <p className="mt-1 text-sm text-ink/70">{a.summary}</p>
            </Link>
          ))}
        </section>
      )}

      {helplines.length > 0 && (
        <section>
          <h2 className="mb-2 font-extrabold">📞 Helplines</h2>
          {helplines.map((h) => (
            <a key={h.id} href={`tel:${h.number}`} className="mb-2 flex items-center justify-between rounded-xl border-2 border-sage-300 bg-white px-4 py-3">
              <span>
                <b>{h.number}</b> · {h.name}
                <span className="block text-xs text-ink/60">{h.description}</span>
              </span>
              <span aria-hidden>📞</span>
            </a>
          ))}
        </section>
      )}

      {facilities.length > 0 && (
        <section>
          <h2 className="mb-2 font-extrabold">🏥 Doctor &amp; facility records</h2>
          {facilities.map((f) => <FacilityCard key={f.id} f={f} />)}
          <Link href={`/doctors?q=${encodeURIComponent(q)}`} className="mt-2 block rounded-xl bg-sage-100 px-4 py-3 text-center font-bold text-sage-700">
            See all facility results in Find Doctor →
          </Link>
        </section>
      )}

      {!loading && q.trim() && facilities.length + articles.length + helplines.length + pages.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-sage-300 bg-white p-8 text-center font-semibold text-ink/60">
          {t("noResults")}
        </p>
      )}
    </div>
  );
}
