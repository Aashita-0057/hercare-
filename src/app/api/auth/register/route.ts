import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { generateOtp, hashSecret } from "@/server/crypto";
import { sendOtpSms, smsDevMode } from "@/server/sms";

const OTP_TTL_MS = 5 * 60 * 1000; // expiry: 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // resend after 60 s
const SENDS_PER_HOUR = 3; // rate limit per number

function cleanPhone(raw: string): string | null {
  const digits = raw
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, ""); // strip country code for 10-digit numbers
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 60);
  const phone = cleanPhone(String(body.phone || ""));

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your name (at least 2 letters)." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
  }

  // ---- Rate limiting ----
  const oneHourAgo = new Date(Date.now() - 3600_000);
  const recentSends = await prisma.otpCode.count({ where: { phone, createdAt: { gte: oneHourAgo } } });

  if (body.resend) {
    const latest = await prisma.otpCode.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
    if (latest && latest.resendAvailableAt > new Date()) {
      const secs = Math.ceil((latest.resendAvailableAt.getTime() - Date.now()) / 1000);
      return NextResponse.json({ error: `Please wait ${secs}s before requesting a new code.`, retryAfter: secs }, { status: 429 });
    }
  } else if (recentSends >= SENDS_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many code requests. Please try again after one hour, or check with a neighbour's help." },
      { status: 429 }
    );
  }

  // ---- Generate + store hashed OTP ----
  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      phone,
      codeHash: hashSecret(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      resendAvailableAt: new Date(Date.now() + RESEND_COOLDOWN_MS),
    },
  });

  const sms = await sendOtpSms(phone, code);
  if (!sms.ok) {
    return NextResponse.json({ error: sms.error || "Could not send the code. Please try again." }, { status: 502 });
  }

  // Dev mode ONLY (no SMS credentials configured, non-production): return the
  // code so the tester can continue. The UI labels this loudly.
  return NextResponse.json({
    sent: true,
    devMode: smsDevMode(),
    devOtp: sms.devOtp, // undefined when a real SMS provider is configured
    expiresInSeconds: OTP_TTL_MS / 1000,
    resendInSeconds: RESEND_COOLDOWN_MS / 1000,
  });
}
