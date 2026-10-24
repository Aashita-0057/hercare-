import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthUser } from "@/server/session";

// Small in-memory throttle so the form can't be flooded.
const recent = new Map<string, number[]>();
const MAX_PER_HOUR = 5;

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

const CATEGORIES = ["harassment", "stalking", "domestic_violence", "cyber_abuse", "workplace", "medical_neglect", "other"];

/**
 * Incident report — works for guests (anonymous) and logged-in users.
 * This is NOT an emergency channel; the UI says so loudly.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 3600_000);
  if (hits.length >= MAX_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many reports from this device recently. If you are in danger, call 112 right now." },
      { status: 429 },
    );
  }
  hits.push(now);
  recent.set(ip, hits);

  const body = await req.json().catch(() => ({}));
  const category = String(body.category || "");
  const description = String(body.description || "").trim();
  const consented = body.consented === true;

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Please choose the type of incident." }, { status: 400 });
  }
  if (description.length < 10) {
    return NextResponse.json({ error: "Please describe what happened (at least a few words)." }, { status: 400 });
  }
  if (description.length > 4000) {
    return NextResponse.json({ error: "Description is too long (4000 characters max)." }, { status: 400 });
  }
  if (!consented) {
    return NextResponse.json({ error: "Please confirm the consent checkbox before submitting." }, { status: 400 });
  }

  const user = await getAuthUser(req);
  const report = await prisma.incidentReport.create({
    data: {
      userId: user?.id ?? null, // null = genuinely anonymous
      category,
      description,
      occurredAt: body.occurredAt ? String(body.occurredAt).slice(0, 40) : null,
      location: body.location ? String(body.location).slice(0, 200) : null,
      contact: body.contact ? String(body.contact).slice(0, 160) : null,
      preferredMethod: ["call", "sms", "whatsapp", "email", "any"].includes(body.preferredMethod)
        ? body.preferredMethod
        : "any",
      consented: true,
    },
  });

  // Short human-readable reference (cuid suffix + time) — no PII.
  const reference = `HC-${report.id.slice(-6).toUpperCase()}`;
  return NextResponse.json({ ok: true, reference, linked: Boolean(user) });
}

/** A logged-in user can list their own reports only. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const reports = await prisma.incidentReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, category: true, status: true, createdAt: true },
  });
  return NextResponse.json({ reports });
}
