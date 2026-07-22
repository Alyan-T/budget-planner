import { getInsightsForCurrentUser } from "@/lib/insights";
import { NextResponse } from "next/server";

export async function POST() {
  const result = await getInsightsForCurrentUser();
  return NextResponse.json(result);
}
