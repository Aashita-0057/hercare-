import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const stories = await prisma.recoveryStory.findMany({ orderBy: { publishedAt: "desc" }, take: 20 });
  return NextResponse.json({ stories });
}
