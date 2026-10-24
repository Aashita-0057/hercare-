import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { verifyHash, sha256 } from "@/server/crypto";
import { createSession, SESSION_COOKIE } from "@/server/session";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 60);
  const phone = String(body.phone || "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  const code = String(body.code || "").trim();

  if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Please check the number and the 6-digit code." }, { status: 400 });
  }

  const latest = await prisma.otpCode.findFirst({
    where: { phone, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return NextResponse.json({ error: "No active code found. Please request a new one.", needResend: true }, { status: 400 });
  }
  if (latest.expiresAt < new Date()) {
    return NextResponse.json({ error: "The code has expired. Please resend.", expired: true }, { status: 400 });
  }
  if (latest.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code.", needResend: true },
      { status: 429 }
    );
  }

  const ok = verifyHash(code, latest.codeHash);
  if (!ok) {
    await prisma.otpCode.update({ where: { id: latest.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "That code is not correct. Please try again." }, { status: 401 });
  }

  // Verified: consume the code, create the account, open a session.
  await prisma.otpCode.update({ where: { id: latest.id }, data: { consumed: true, verified: true } });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { name: name || "Member", phone, languageCode: "" },
    });
  } else if (name && user.name !== name) {
    user = await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, phone: user.phone, languageCode: user.languageCode },
  });
  return createSession(user.id, res);
}

export async function DELETE(req: NextRequest) {
  // Logout: delete the session row and clear the cookie.
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
