import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";
import { toDTO } from "../doctors/route";

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized;
  const saved = await prisma.savedFacility.findMany({
    where: { userId: user.id },
    include: { facility: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    ids: saved.map((s) => s.facilityId),
    facilities: saved.map((s) => toDTO(s.facility)),
  });
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized;
  const body = await req.json().catch(() => ({}));
  const facilityId = String(body.facilityId || "");
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) return NextResponse.json({ error: "Unknown facility" }, { status: 404 });
  await prisma.savedFacility.upsert({
    where: { userId_facilityId: { userId: user.id, facilityId } },
    create: { userId: user.id, facilityId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized;
  const facilityId = req.nextUrl.searchParams.get("facilityId") || "";
  await prisma.savedFacility.deleteMany({ where: { userId: user.id, facilityId } });
  return NextResponse.json({ ok: true });
}
