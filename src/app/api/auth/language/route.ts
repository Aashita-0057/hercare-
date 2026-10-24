import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";
import { LANG_MAP } from "@/lib/languages";

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const code = String(body.languageCode || "");
  if (!LANG_MAP[code]) {
    return NextResponse.json({ error: "Unknown language" }, { status: 400 });
  }
  const dialect = body.dialect ? String(body.dialect).slice(0, 40) : null;
  await prisma.user.update({ where: { id: user.id }, data: { languageCode: code, dialect } });
  return NextResponse.json({ ok: true, languageCode: code, dialect });
}
