import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export type InsightsResult = { insights: string[]; suggestion: string };

/**
 * Computes spending insights for the current logged-in user.
 * Shared by app/dashboard/page.tsx (direct import) and
 * app/api/insights/route.ts (HTTP endpoint), so the logic
 * only needs to be maintained in one place.
 */
export async function getInsightsForCurrentUser(): Promise<InsightsResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { insights: [], suggestion: "" };

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, occurred_at, categories(name, type)")
    .eq("user_id", user.id)
    .gte("occurred_at", threeMonthsAgo.toISOString().slice(0, 10));

  if (!transactions || transactions.length < 3) {
    return { insights: [], suggestion: "" };
  }

  // deterministic math in code — AI only narrates
  const byMonth: Record<string, { income: number; expense: number }> = {};
  const byCategory: Record<string, number> = {};

  transactions.forEach((t: any) => {
    const m = t.occurred_at.slice(0, 7);
    byMonth[m] ??= { income: 0, expense: 0 };
    if (t.categories?.type === "income") byMonth[m].income += t.amount;
    else {
      byMonth[m].expense += t.amount;
      byCategory[t.categories?.name ?? "Uncategorized"] =
        (byCategory[t.categories?.name ?? "Uncategorized"] || 0) + t.amount;
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
