import { NextRequest, NextResponse } from "next/server";
import { askAssistant } from "@/server/assistant";

// Simple in-memory rate limit (per process): 20 requests / minute / IP.
const buckets = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.t > 60_000) {
    buckets.set(ip, { n: 1, t: now });
    return false;
  }
  b.n += 1;
  return b.n > 20;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Please pause a minute between questions." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const messages = Array.isArray(body.messages)
    ? body.messages
        .slice(-10)
        .filter((m: { role?: string; content?: string }) =>
          typeof m.role === "string" && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && m.content.length < 2000
        )
    : [];
  const lang = String(body.lang || "en").slice(0, 8);
  if (messages.length === 0) {
    return NextResponse.json({ error: "No question received" }, { status: 400 });
  }
  const result = await askAssistant(messages, lang);
  return NextResponse.json(result);
}
