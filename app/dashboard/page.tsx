import { createClient } from "@/lib/supabase/server";
import { getInsightsForCurrentUser } from "@/lib/insights";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { TrendChart } from "@/components/TrendChart";
import { InsightsCard } from "@/components/InsightsCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, occurred_at, categories(name, type)")
    .eq("user_id", user!.id)
    .gte("occurred_at", startOfMonth.toISOString().slice(0, 10));

  const income = (transactions ?? [])
    .filter((t: any) => t.categories?.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = (transactions ?? [])
    .filter((t: any) => t.categories?.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const ratio = income > 0 ? ((expenses / income) * 100).toFixed(0) : "—";

  const byCategory: Record<string, number> = {};
  (transactions ?? []).forEach((t: any) => {
    if (t.categories?.type === "expense") {
      byCategory[t.categories.name] = (byCategory[t.categories.name] || 0) + t.amount;
    }
  });
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  // simple linear projection for end-of-month
  const daysSoFar = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(), new Date().getMonth() + 1, 0
  ).getDate();
  const dailyAvg = expenses / daysSoFar;
  const projectedTotal = dailyAvg * daysInMonth;

  const trendData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day: String(day),
      actual: day <= daysSoFar ? dailyAvg * day : null,
      projected: day >= daysSoFar ? dailyAvg * day : null,
    };
  });

  // Direct import instead of an internal HTTP round-trip — avoids
  // needing to forward cookies manually to our own API route.
  const insights = await getInsightsForCurrentUser();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Income this month</p>
          <p className="text-2xl font-medium">${income.toFixed(0)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Expenses this month</p>
          <p className="text-2xl font-medium">${expenses.toFixed(0)}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Expense-to-income ratio</p>
          <p className="text-2xl font-medium">{ratio}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <h3 className="font-medium mb-2">Spending by category</h3>
          <CategoryPieChart data={pieData} />
        </div>
        <div className="bg-white border rounded-xl p-4">
          <h3 className="font-medium mb-2">
            Trend — projected end of month: ${projectedTotal.toFixed(0)}
          </h3>
          <TrendChart data={trendData} />
        </div>
      </div>

      {insights.insights.length > 0 && (
        <InsightsCard insights={insights.insights} suggestion={insights.suggestion} />
      )}
    </div>
  );
}
