import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sha256 } from "@/server/crypto";
import { SESSION_COOKIE } from "@/server/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set("hc_journal", "", { maxAge: 0, path: "/" });
  return res;
}
