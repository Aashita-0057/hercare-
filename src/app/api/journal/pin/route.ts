import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hashSecret, verifyHash } from "@/server/crypto";
import { requireUser, createJournalSession, attachJournalCookie } from "@/server/session";

// In-memory failed-PIN throttle per user: 5 tries / 10 min.
const fails = new Map<string, { n: number; t: number }>();

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized;
  return NextResponse.json({ hasPin: Boolean(user.pinHash) });
}

/**
 * POST { pin }
 * First call sets the PIN; later calls verify it and open a short journal
 * session (auto-locks server-side after 2 minutes).
 */
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin || "");
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be exactly 4 digits." }, { status: 400 });
  }

  const f = fails.get(user.id);
  if (f && f.n >= 5 && Date.now() - f.t < 10 * 60_000) {
    return NextResponse.json({ error: "Too many wrong tries. Wait 10 minutes." }, { status: 429 });
  }

  if (!user.pinHash) {
    const hash = hashSecret(pin + (process.env.APP_SECRET || ""));
    await prisma.user.update({ where: { id: user.id }, data: { pinHash: hash, pinSalt: "v1" } });
  } else {
    const ok = verifyHash(pin + (process.env.APP_SECRET || ""), user.pinHash);
    if (!ok) {
      fails.set(user.id, f ? { n: f.n + 1, t: f.t } : { n: 1, t: Date.now() });
      return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
    }
    fails.delete(user.id);
  }

  const token = await createJournalSession(user.id);
  return attachJournalCookie(NextResponse.json({ unlocked: true }), token);
}
