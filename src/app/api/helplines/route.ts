import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

/** Helplines stay available without login — emergency info must never be gated. */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "";
  const all = await prisma.helpline.findMany();
  const list = category ? all.filter((h) => h.categories.includes(category)) : all;
  return NextResponse.json({ helplines: list });
}
