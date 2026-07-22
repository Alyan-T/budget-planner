import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Pure deterministic forecast — no AI needed for arithmetic.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, categories(type)")
    .eq("user_id", user.id)
    .gte("occurred_at", startOfMonth.toISOString().slice(0, 10));

  const expenses = (transactions ?? [])
    .filter((t: any) => t.categories?.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const daysSoFar = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(), new Date().getMonth() + 1, 0
  ).getDate();

  const dailyAvg = expenses / daysSoFar;
  const projected = dailyAvg * daysInMonth;

  return NextResponse.json({
    spentSoFar: expenses,
    dailyAverage: dailyAvg,
    projectedEndOfMonth: projected,
    daysRemaining: daysInMonth - daysSoFar,
  });
}
