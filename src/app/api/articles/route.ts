import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") || "en";
  const category = sp.get("category") || "";
  const q = (sp.get("q") || "").toLowerCase().trim();
  const slug = sp.get("slug") || "";

  if (slug) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: { translations: true },
    });
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const tr =
      article.translations.find((t) => t.lang === lang) ||
      article.translations.find((t) => t.lang === "en");
    const fallback = tr?.lang !== lang && article.translations.some((t) => t.lang === "en");
    return NextResponse.json({ article: { slug: article.slug, category: article.category, icon: article.icon }, translation: tr, englishFallback: fallback });
  }

  const articles = await prisma.article.findMany({
    where: category ? { category } : {},
    include: { translations: true },
  });

  const list = articles
    .map((a) => {
      const tr = a.translations.find((t) => t.lang === lang) || a.translations.find((t) => t.lang === "en");
      if (!tr) return null;
      return {
        slug: a.slug,
        category: a.category,
        icon: a.icon,
        title: tr.title,
        summary: tr.summary,
        englishFallback: tr.lang !== lang,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .filter((a) => !q || `${a.title} ${a.summary}`.toLowerCase().includes(q));

  return NextResponse.json({ articles: list });
}
