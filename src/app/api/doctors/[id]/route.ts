import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await prisma.facility.findUnique({
    where: { id },
    include: { verifications: { orderBy: { verifiedAt: "desc" }, take: 10 } },
  });
  if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let services: string[] = [];
  let languagesSpoken: string[] = [];
  try { services = JSON.parse(f.services); } catch { /* empty */ }
  try { languagesSpoken = JSON.parse(f.languagesSpoken); } catch { /* empty */ }
  return NextResponse.json({
    facility: { ...f, services, languagesSpoken, lastVerifiedAt: f.lastVerifiedAt?.toISOString() ?? null },
    verifications: f.verifications,
  });
}
