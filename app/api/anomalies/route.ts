import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { CategoryDoc, BudgetDoc, TransactionDoc } from "@/lib/models";
import { detectAnomalies } from "@/lib/anomaly-detector";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = new ObjectId(user.userId);
    const db = await getDb();

    // 1. Fetch categories
    const categories = await db.collection<CategoryDoc>("categories").find({ userId }).toArray();

    // 2. Fetch budgets for the current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Note: models.ts budget month is "always the 1st of the month"
    // The existing budget API does:
    // const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const budgets = await db.collection<BudgetDoc>("budgets").find({ 
      userId, 
      month: currentMonth 
    }).toArray();

    // 3. Fetch transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const transactions = await db.collection<TransactionDoc>("transactions").find({
      userId,
      occurredAt: { $gte: thirtyDaysAgo }
    }).toArray();

    // 4. Time vars
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysSoFar = now.getDate();

    // 5. Detect
    const alerts = detectAnomalies(transactions, budgets, categories, daysInMonth, daysSoFar);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Failed to detect anomalies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
