import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export interface FacilityDTO {
  id: string;
  name: string;
  kind: string;
  ownership: string;
  doctorName: string | null;
  isFemaleDoctor: boolean;
  femaleDoctorAvail: boolean | null;
  specialty: string | null;
  qualifications: string | null;
  address: string;
  state: string;
  district: string;
  block: string | null;
  village: string | null;
  phone: string | null;
  feeText: string;
  feeVerified: boolean;
  freeConfirmed: boolean;
  openingHours: string | null;
  services: string[];
  languagesSpoken: string[];
  photoUrl: string | null;
  mapUrl: string | null;
  hasWomenWard: boolean;
  isSample: boolean;
  lastVerifiedAt: string | null;
}

export function toDTO(f: {
  id: string; name: string; kind: string; ownership: string; doctorName: string | null;
  isFemaleDoctor: boolean; femaleDoctorAvail: boolean | null; specialty: string | null;
  qualifications: string | null; address: string; state: string; district: string;
  block: string | null; village: string | null; phone: string | null; feeText: string;
  feeVerified: boolean; freeConfirmed: boolean; openingHours: string | null; services: string;
  languagesSpoken: string; photoUrl: string | null; mapUrl: string | null; hasWomenWard: boolean;
  isSample: boolean; lastVerifiedAt: Date | null;
}): FacilityDTO {
  let services: string[] = [];
  let languagesSpoken: string[] = [];
  try { services = JSON.parse(f.services); } catch { /* keep empty */ }
  try { languagesSpoken = JSON.parse(f.languagesSpoken); } catch { /* keep empty */ }
  return { ...f, services, languagesSpoken, lastVerifiedAt: f.lastVerifiedAt?.toISOString() ?? null };
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const state = (sp.get("state") || "").trim();
  const district = (sp.get("district") || "").trim();
  const block = (sp.get("block") || "").trim();
  const village = (sp.get("village") || "").trim();
  const kind = (sp.get("kind") || "").trim();
  const specialty = (sp.get("specialty") || "").trim();
  const ownership = (sp.get("ownership") || "").trim();
  const female = sp.get("female") === "1";
  const category = (sp.get("category") || "").trim(); // rehab | support (women-centred directory)

  const where: Record<string, unknown> = {};
  if (state) where.state = { contains: state };
  if (district) where.district = { contains: district };
  if (block) where.block = { contains: block };
  if (village) where.village = { contains: village };
  if (kind) where.kind = kind;
  if (specialty) where.specialty = { contains: specialty };
  if (ownership) where.ownership = ownership;
  if (female) where.OR = [{ isFemaleDoctor: true }, { femaleDoctorAvail: true }];

  const rows = await prisma.facility.findMany({ where: Object.keys(where).length ? where : {}, take: 100 });
  let dtos = rows.map(toDTO);

  if (category === "rehab") {
    dtos = dtos.filter((f) => ["rehab", "psychiatric", "counsellor", "ngo"].includes(f.kind));
  } else if (category === "support") {
    dtos = dtos.filter((f) => ["support_centre", "ngo", "legal_aid", "hospital", "counsellor"].includes(f.kind));
  }

  if (q) {
    const terms = q.toLowerCase().split(/\s+/);
    dtos = dtos.filter((f) => {
      const hay = [f.name, f.doctorName, f.specialty, f.address, f.district, f.block, f.village, f.state, ...f.services]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  // Distinct location facets for cascading dropdowns (manual, no-GPS search).
  const all = await prisma.facility.findMany({ select: { state: true, district: true, block: true }, take: 500 });
  const states = [...new Set(all.map((a) => a.state))].sort();
  const districts = [...new Set(all.filter((a) => !state || a.state === state).map((a) => a.district))].sort();
  const blocks = [
    ...new Set(all.filter((a) => (!district || a.district === district) && a.block).map((a) => a.block as string)),
  ].sort();

  return NextResponse.json({ facilities: dtos.slice(0, 60), facets: { states, districts, blocks } });
}
