import { GoogleGenerativeAI } from "@google/generative-ai";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryMap, attachCategories } from "@/lib/queries";
import type { TransactionDoc } from "@/lib/models";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export type InsightsResult = { insights: string[]; suggestion: string };

/**
 * Computes spending insights for the current logged-in user.
 * Shared by app/dashboard/page.tsx (direct import) and
 * app/api/insights/route.ts (HTTP endpoint), so the logic
 * only needs to be maintained in one place.
 */
export async function getInsightsForCurrentUser(): Promise<InsightsResult> {
  const user = await getCurrentUser();
  if (!user) return { insights: [], suggestion: "" };

  const db = await getDb();
  const userId = new ObjectId(user.userId);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const rawTransactions = await db
    .collection<TransactionDoc>("transactions")
    .find({ userId, occurredAt: { $gte: threeMonthsAgo } })
    .toArray();

  if (rawTransactions.length < 3) {
    return { insights: [], suggestion: "" };
  }

  const categoryMap = await getCategoryMap(db, userId);
  const transactions = attachCategories(rawTransactions, categoryMap);

  // deterministic math in code — AI only narrates
  const byMonth: Record<string, { income: number; expense: number }> = {};
  const byCategory: Record<string, number> = {};

  transactions.forEach((t) => {
    const m = t.occurredAt.toISOString().slice(0, 7);
    byMonth[m] ??= { income: 0, expense: 0 };
    if (t.category?.type === "income") byMonth[m].income += t.amount;
    else {
      byMonth[m].expense += t.amount;
      const name = t.category?.name ?? "Uncategorized";
      byCategory[name] = (byCategory[name] || 0) + t.amount;
    }
  });

  const summary = {
    monthlyTotals: byMonth,
    topCategories: Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Given this spending summary over the last 3 months: ${JSON.stringify(summary)}
Write 2-3 short, specific, encouraging insights about the person's spending patterns (trends, biggest categories, changes month to month), and one concrete, actionable saving suggestion.
Return exactly: {"insights": string[], "suggestion": string}
Do not invent numbers not present in the summary.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch {
    return { insights: [], suggestion: "" };
  }
}
