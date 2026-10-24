import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";

const DAY_MS = 86400_000;

/** Pregnancy week estimate from EDD (Naegele convention: 280 days). */
function weekFromEdd(edd: Date | null) {
  if (!edd) return null;
  const gestationDays = 280 - Math.round((edd.getTime() - Date.now()) / DAY_MS);
  if (gestationDays < 0 || gestationDays > 300) return null;
  return {
    weeks: Math.floor(gestationDays / 7),
    days: gestationDays % 7,
    trimester: gestationDays < 84 ? 1 : gestationDays < 196 ? 2 : 3,
  };
}

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;

  const [profiles, maternal, infants, appointments] = await Promise.all([
    prisma.pregnancyProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.maternalRecord.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 }),
    prisma.infantLog.findMany({ where: { userId: user.id }, orderBy: { takenAt: "desc" }, take: 40 }),
    prisma.appointment.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 20 }),
  ]);

  const active = profiles[0] || null;
  return NextResponse.json({
    profile: active
      ? {
          id: active.id,
          label: active.label,
          eddDate: active.eddDate ? active.eddDate.toISOString() : null,
          status: active.status,
          weekInfo: active.eddDate ? weekFromEdd(active.eddDate) : null,
        }
      : null,
    maternal: maternal.map((m) => ({
      id: m.id, date: m.date.toISOString(), bpHigh: m.bpHigh, bpLow: m.bpLow,
      weightKg: m.weightKg, ironTaken: m.ironTaken, notes: m.notes,
    })),
    infants: infants.map((i) => ({
      id: i.id, babyLabel: i.babyLabel, type: i.type, value: i.value, takenAt: i.takenAt.toISOString(),
    })),
    appointments: appointments.map((a) => ({
      id: a.id, title: a.title, forWhom: a.forWhom,
      date: a.date.toISOString(), time: a.time, notes: a.notes,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");

  if (action === "profile") {
    const edd = body.eddDate ? new Date(String(body.eddDate)) : null;
    if (!edd || isNaN(edd.getTime())) {
      return NextResponse.json({ error: "Please enter the expected delivery date." }, { status: 400 });
    }
    const status = body.status === "postpartum" ? "postpartum" : "antenatal";
    const profile = await prisma.pregnancyProfile.create({
      data: { userId: user.id, label: String(body.label || "Pregnancy").slice(0, 60), eddDate: edd, status },
    });
    return NextResponse.json({ ok: true, id: profile.id });
  }

  if (action === "maternal") {
    const date = new Date(String(body.date || new Date().toISOString()));
    if (isNaN(date.getTime())) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    const num = (v: unknown) => (v === "" || v == null ? null : Math.round(Number(v) * 10) / 10);
    const bpHigh = num(body.bpHigh); const bpLow = num(body.bpLow);
    if (bpHigh != null && (bpHigh < 60 || bpHigh > 260)) return NextResponse.json({ error: "BP systolic looks wrong (60–260)." }, { status: 400 });
    if (bpLow != null && (bpLow < 30 || bpLow > 160)) return NextResponse.json({ error: "BP diastolic looks wrong (30–160)." }, { status: 400 });
    const rec = await prisma.maternalRecord.create({
      data: {
        userId: user.id, date,
        bpHigh: bpHigh == null ? null : Math.round(bpHigh),
        bpLow: bpLow == null ? null : Math.round(bpLow),
        weightKg: num(body.weightKg),
        ironTaken: body.ironTaken === true ? true : body.ironTaken === false ? false : null,
        notes: body.notes ? String(body.notes).slice(0, 300) : null,
      },
    });
    // High BP during pregnancy is a warning sign — surface it honestly.
    const bpWarning = rec.bpHigh != null && rec.bpHigh >= 140;
    return NextResponse.json({ ok: true, id: rec.id, bpWarning });
  }

  if (action === "infant") {
    const type = String(body.type || "");
    if (!["feeding", "sleep", "vaccine", "growth", "appointment"].includes(type)) {
      return NextResponse.json({ error: "Unknown infant log type." }, { status: 400 });
    }
    const takenAt = body.takenAt ? new Date(String(body.takenAt)) : new Date();
    if (isNaN(takenAt.getTime())) return NextResponse.json({ error: "Invalid time." }, { status: 400 });
    const log = await prisma.infantLog.create({
      data: {
        userId: user.id,
        babyLabel: String(body.babyLabel || "Baby").slice(0, 40),
        type, value: String(body.value || "").slice(0, 200), takenAt,
      },
    });
    return NextResponse.json({ ok: true, id: log.id });
  }

  if (action === "appointment") {
    const date = new Date(String(body.date || ""));
    if (isNaN(date.getTime())) return NextResponse.json({ error: "Invalid appointment date." }, { status: 400 });
    const appt = await prisma.appointment.create({
      data: {
        userId: user.id,
        title: String(body.title || "Appointment").slice(0, 100),
        forWhom: ["mother", "infant", "self"].includes(body.forWhom) ? body.forWhom : "self",
        date,
        time: body.time ? String(body.time).slice(0, 10) : null,
        notes: body.notes ? String(body.notes).slice(0, 300) : null,
      },
    });
    return NextResponse.json({ ok: true, id: appt.id });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireUser(req);
  if (!user) return unauthorized!;
  const kind = req.nextUrl.searchParams.get("kind") || "";
  const id = req.nextUrl.searchParams.get("id") || "";
  const whereAnd = { id, userId: user.id };
  if (kind === "maternal") {
    const row = await prisma.maternalRecord.findFirst({ where: whereAnd });
    if (!row) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    await prisma.maternalRecord.delete({ where: { id: row.id } });
  } else if (kind === "infant") {
    const row = await prisma.infantLog.findFirst({ where: whereAnd });
    if (!row) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    await prisma.infantLog.delete({ where: { id: row.id } });
  } else if (kind === "appointment") {
    const row = await prisma.appointment.findFirst({ where: whereAnd });
    if (!row) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    await prisma.appointment.delete({ where: { id: row.id } });
  } else {
    return NextResponse.json({ error: "Unknown record kind." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
