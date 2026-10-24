import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/session";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      languageCode: user.languageCode,
      dialect: user.dialect,
      previousDailySpend: user.previousDailySpend,
      hasPin: Boolean(user.pinHash),
    },
  });
}
