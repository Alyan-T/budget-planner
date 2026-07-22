import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryMap, attachCategories } from "@/lib/queries";
import type { TransactionDoc } from "@/lib/models";

// Pure deterministic forecast — no AI needed for arithmetic.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = new ObjectId(user.userId);
  const db = await getDb();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const rawTransactions = await db
    .collection<TransactionDoc>("transactions")
    .find({ userId, occurredAt: { $gte: startOfMonth } })
    .toArray();

  const categoryMap = await getCategoryMap(db, userId);
  const transactions = attachCategories(rawTransactions, categoryMap);

  const expenses = transactions
    .filter((t) => t.category?.type === "expense")
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
