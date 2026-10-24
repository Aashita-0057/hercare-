import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireJournalUser } from "@/server/session";

/** GET — everything the journal screen needs (only while unlocked). */
export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireJournalUser(req);
  if (!user) return unauthorized;

  const [days, cravings, spend] = await Promise.all([
    prisma.journalDay.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
    prisma.cravingLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.user.findUnique({ where: { id: user.id }, select: { previousDailySpend: true } }),
  ]);
  return NextResponse.json({ days, cravings, previousDailySpend: spend?.previousDailySpend ?? null });
}

/**
 * POST — mark a day, log a craving, or set daily spend.
 * { op: "day" | "craving" | "spend", ... }
 */
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireJournalUser(req);
  if (!user) return unauthorized;

  const body = await req.json().catch(() => ({}));

  if (body.op === "day") {
    const date = new Date(String(body.date));
    if (isNaN(date.getTime())) return NextResponse.json({ error: "Bad date" }, { status: 400 });
    const status = body.status === "difficult" ? "difficult" : "sober";
    const note = body.note ? String(body.note).slice(0, 500) : null;
    const day = await prisma.journalDay.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: { userId: user.id, date, status, note },
      update: { status, note },
    });
    return NextResponse.json({ day });
  }

  if (body.op === "craving") {
    const icons = ["cravings", "anxiety", "headache", "bodypain", "sleep", "mood", "other"];
    const icon = icons.includes(String(body.icon)) ? String(body.icon) : "other";
    const level = Math.min(5, Math.max(1, Number(body.level) || 1));
    const note = body.note ? String(body.note).slice(0, 300) : null;
    const log = await prisma.cravingLog.create({ data: { userId: user.id, icon, level, note } });
    return NextResponse.json({ log });
  }

  if (body.op === "spend") {
    const v = Math.min(100000, Math.max(0, Number(body.previousDailySpend) || 0));
    await prisma.user.update({ where: { id: user.id }, data: { previousDailySpend: v } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
}
