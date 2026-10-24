import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";

interface PeriodDTO {
  id: string;
  startDate: string;
  endDate: string | null;
  symptoms: string[];
  notes: string | null;
}

const DAY_MS = 86400_000;

/**
 * Prediction from home-recorded dates only. Labelled as an ESTIMATE in the
 * UI — cycle tracking apps are not contraception or diagnosis.
 */
function predictCycle(starts: Date[]) {
  if (starts.length < 2) return null;
  const sorted = [...starts].sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round((sorted[i].getTime() - sorted[i - 1].getTime()) / DAY_MS);
    if (gap >= 15 && gap <= 60) gaps.push(gap); // ignore impossible gaps
  }
  if (gaps.length === 0) return null;
  const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const variability = Math.max(...gaps) - Math.min(...gaps);
  const last = sorted[sorted.length - 1];
  return {
    averageCycleDays: avg,
    averagePeriodDays: null as number | null,
    nextStartEstimate: new Date(last.getTime() + avg * DAY_MS).toISOString(),
    reliability: variability <= 4 ? "fairly consistent" : variability <= 9 ? "somewhat variable" : "very variable",
    basedOnLogs: sorted.length,
  };
}

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;

  const logs = await prisma.periodLog.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    take: 24,
  });
  const dtos: PeriodDTO[] = logs.map((l) => ({
    id: l.id,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate ? l.endDate.toISOString() : null,
    symptoms: JSON.parse(l.symptoms) as string[],
    notes: l.notes,
  }));
  return NextResponse.json({ logs: dtos, prediction: predictCycle(logs.map((l) => l.startDate)) });
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;

  const body = await req.json().catch(() => ({}));
  const start = new Date(String(body.startDate || ""));
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: "Please provide a valid start date." }, { status: 400 });
  }
  const end = body.endDate ? new Date(String(body.endDate)) : null;
  if (end && isNaN(end.getTime())) {
    return NextResponse.json({ error: "Please provide a valid end date." }, { status: 400 });
  }
  if (end && end.getTime() < start.getTime()) {
    return NextResponse.json({ error: "End date cannot be before start date." }, { status: 400 });
  }
  const symptoms = Array.isArray(body.symptoms)
    ? body.symptoms.map((s: unknown) => String(s).slice(0, 40)).slice(0, 12)
    : [];

  const log = await prisma.periodLog.create({
    data: {
      userId: user.id,
      startDate: start,
      endDate: end,
      symptoms: JSON.stringify(symptoms),
      notes: body.notes ? String(body.notes).slice(0, 500) : null,
    },
  });
  return NextResponse.json({ ok: true, id: log.id });
}

export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;
  const id = req.nextUrl.searchParams.get("id") || "";
  const log = await prisma.periodLog.findFirst({ where: { id, userId: user.id } });
  if (!log) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  await prisma.periodLog.delete({ where: { id: log.id } });
  return NextResponse.json({ ok: true });
}
