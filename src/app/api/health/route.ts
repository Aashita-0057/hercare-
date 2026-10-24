import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";
import { SYMPTOMS, triage, type SymptomId, type TriageLevel } from "@/server/triage";

/** Symptom list + guidance copy for the visual questionnaire. */
export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;

  const entries = await prisma.healthEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({
    symptoms: SYMPTOMS,
    history: entries.map((e) => ({
      id: e.id, level: e.level, createdAt: e.createdAt.toISOString(),
      symptoms: JSON.parse(e.symptoms) as string[],
    })),
  });
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;

  const body = await req.json().catch(() => ({}));
  const raw = Array.isArray(body.symptoms) ? body.symptoms : [];
  const valid = new Set(SYMPTOMS.map((s) => s.id));
  const symptoms = [...new Set(raw.map((s: unknown) => String(s)))] as SymptomId[];
  if (symptoms.some((s) => !valid.has(s))) {
    return NextResponse.json({ error: "Unknown symptom selection." }, { status: 400 });
  }

  // Conservative rule-based triage — colour NEVER overrides emergency advice.
  const level: TriageLevel = triage(symptoms);
  const entry = await prisma.healthEntry.create({
    data: { userId: user.id, symptoms: JSON.stringify(symptoms), level },
  });

  return NextResponse.json({
    ok: true,
    id: entry.id,
    level,
    advice: {
      green:
        "No urgent warning signs in these answers. Keep up routine check-ups, and see a doctor if anything worries you — your feeling matters more than any colour.",
      yellow:
        "These symptoms deserve attention soon (within a few days). Visit a PHC/clinic or talk to the AI assistant about what to ask the doctor. If any symptom suddenly worsens, treat it as urgent.",
      red:
        "One or more danger signs were selected. This can be life-threatening — CALL 112 NOW or go to the nearest emergency room immediately. Do not wait, do not self-treat.",
    }[level],
  });
}
