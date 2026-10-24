/**
 * SMS OTP provider abstraction.
 *
 * Production path: MSG91 "flow" API with a custom OTP template so the
 * code generated here is the code delivered by SMS. Set MSG91_AUTH_KEY,
 * MSG91_SMS_FLOW_ID and MSG91_SENDER_ID in .env — see README
 * "External services" for step-by-step setup.
 *
 * When credentials are absent the app runs in a clearly-labelled
 * DEVELOPMENT MODE: the OTP is returned by the API and shown on screen.
 * The UI always states this loudly; a hardcoded OTP is never used as
 * real authentication and dev mode is disabled in production.
 */

export type SmsResult = { ok: boolean; devOtp?: string; error?: string };

export function smsDevMode(): boolean {
  return !process.env.MSG91_AUTH_KEY || !process.env.MSG91_SMS_FLOW_ID;
}

export async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  if (smsDevMode()) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "SMS provider not configured" };
    }
    return { ok: true, devOtp: code };
  }

  try {
    const params = new URLSearchParams({
      flow: process.env.MSG91_SMS_FLOW_ID!,
      route: "4",
      mobile: `91${phone}`,
      sender: process.env.MSG91_SENDER_ID || "HERCR+",
      authkey: process.env.MSG91_AUTH_KEY!,
      otp: code,
    });
    const res = await fetch(`https://api.msg91.com/api/v2/flow/?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `SMS send failed (${res.status})` };
    // MSG91 replies with a JSON type:"success" on the flow route.
    if (/"type"\s*:\s*"success"/i.test(text)) return { ok: true };
    return { ok: false, error: text.slice(0, 200) };
  } catch {
    return { ok: false, error: "SMS provider unreachable" };
  }
}
