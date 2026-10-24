import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import { sha256, generateToken } from "./crypto";

export const SESSION_COOKIE = "hc_session";
export const JOURNAL_COOKIE = "hc_journal";
const SESSION_DAYS = 30;
const JOURNAL_SECONDS = 120; // journal auto-locks after 2 minutes

type CookieLike = { get(name: string): { value: string } | undefined };

async function resolveUserId(cookieStore: CookieLike, cookieName: string) {
  const raw = cookieStore.get(cookieName)?.value;
  if (!raw) return null;
  const tokenHash = sha256(raw);
  if (cookieName === SESSION_COOKIE) {
    const session = await prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt < new Date()) return null;
    return session.userId;
  }
  const js = await prisma.journalSession.findUnique({ where: { tokenHash } });
  if (!js || js.expiresAt < new Date()) return null;
  // Sliding window: any journal activity extends the lock by 2 minutes.
  await prisma.journalSession.update({
    where: { id: js.id },
    data: { expiresAt: new Date(Date.now() + JOURNAL_SECONDS * 1000) },
  });
  return js.userId;
}

/** Get the authenticated user from the request cookies, or null. */
export async function getAuthUser(req: NextRequest) {
  const userId = await resolveUserId(req.cookies, SESSION_COOKIE);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, languageCode: true, dialect: true, previousDailySpend: true, pinHash: true, pinSalt: true },
  });
}

/** Get the user whose journal is currently unlocked, or null. */
export async function getJournalUser(req: NextRequest) {
  const userId = await resolveUserId(req.cookies, JOURNAL_COOKIE);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, previousDailySpend: true } });
}

/**
 * Route-handler guard: returns a user or a ready-to-return 401 response.
 * All sensitive data access goes through this — strict server-side
 * authorization, never client-side trust.
 */
export async function requireUser(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return { user: null, unauthorized: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) } as const;
  }
  return { user, unauthorized: null } as const;
}

export async function requireJournalUser(req: NextRequest) {
  const user = await getJournalUser(req);
  if (!user) {
    return { user: null, unauthorized: NextResponse.json({ error: "Journal locked" }, { status: 401 }) } as const;
  }
  return { user, unauthorized: null } as const;
}

/** Create an authenticated session and set the httpOnly cookie. */
export async function createSession(userId: string, res: NextResponse) {
  const token = generateToken();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000),
    },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86400,
    path: "/",
  });
  return res;
}

/** Unlock the journal for a short window (separate from auth session). */
export function attachJournalCookie(res: NextResponse, token: string) {
  res.cookies.set(JOURNAL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: JOURNAL_SECONDS,
    path: "/",
  });
  return res;
}

export async function createJournalSession(userId: string) {
  const token = generateToken();
  await prisma.journalSession.create({
    data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + JOURNAL_SECONDS * 1000) },
  });
  return token;
}

/** Server-side helper for pages that render with a session cookie store. */
export async function getServerUserFromNextCookies() {
  const store = await cookies();
  const userId = await resolveUserId(store, SESSION_COOKIE);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, phone: true, languageCode: true },
  });
}
