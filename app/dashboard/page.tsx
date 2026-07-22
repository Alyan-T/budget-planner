import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryMap, attachCategories } from "@/lib/queries";
import { getInsightsForCurrentUser } from "@/lib/insights";
import type { TransactionDoc } from "@/lib/models";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { TrendChart } from "@/components/TrendChart";
import { CashFlowChart } from "@/components/CashFlowChart";
import { InsightsCard } from "@/components/InsightsCard";
import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import AnomalyAlerts from "@/components/AnomalyAlerts";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
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

  const income = transactions
    .filter((t) => t.category?.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.category?.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const totalBalance = income - expenses;
  const ratio = income > 0 ? ((expenses / income) * 100).toFixed(0) : "—";

  const byCategory: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.category?.type === "expense") {
      byCategory[t.category.name] = (byCategory[t.category.name] || 0) + t.amount;
    }
  });
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  const dailyCashFlow: Record<string, { date: string; income: number; expenses: number }> = {};
  transactions.forEach((t) => {
    const d = t.occurredAt.toISOString().split("T")[0];
    if (!dailyCashFlow[d]) {
      dailyCashFlow[d] = { date: d, income: 0, expenses: 0 };
    }
    if (t.category?.type === "income") {
      dailyCashFlow[d].income += t.amount;
    } else {
      dailyCashFlow[d].expenses += t.amount;
    }
  });
  const cashFlowData = Object.values(dailyCashFlow).sort((a, b) => a.date.localeCompare(b.date));

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

  const insights = await getInsightsForCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      
      {/* Black Hero Card */}
      <div className="bg-black rounded-3xl p-8 flex flex-col gap-8 text-white shadow-soft">
        <div>
          <p className="text-[12px] font-bold tracking-widest uppercase text-zinc-400 mb-2">Total Balance</p>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
             <p className="text-[36px] md:text-[48px] font-bold tracking-tight">
               Rs. {totalBalance.toFixed(0)}
             </p>
             <span className="text-[14px] md:text-[16px] font-bold text-success flex items-center">
               ↑2.4%
             </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-1">Monthly Income</p>
            <p className="text-[20px] font-bold text-white">
              Rs. {income.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-1">Monthly Expenses</p>
            <p className="text-[20px] font-bold text-white">
              Rs. {expenses.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <AnomalyAlerts />

      <div className="bg-surface rounded-3xl p-6 md:p-8 flex flex-col shadow-soft">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-[20px] font-bold text-primary">Cash Flow</h3>
          <span className="bg-surface-dim text-on-surface-variant px-3 py-1 rounded-full text-[13px] font-bold">This Month</span>
        </div>
        <div className="flex-1 min-h-[300px]">
          <CashFlowChart data={cashFlowData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-3xl p-6 md:p-8 flex flex-col shadow-soft">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-[20px] font-bold text-primary">Spending Summary</h3>
            <span className="bg-surface-dim text-on-surface-variant px-3 py-1 rounded-full text-[13px] font-bold">Last 6 Months</span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <CategoryPieChart data={pieData} />
          </div>
        </div>
        <div className="bg-surface rounded-3xl p-6 md:p-8 flex flex-col shadow-soft">
          <div className="flex flex-col mb-6">
            <p className="text-[12px] font-bold tracking-widest uppercase text-on-surface-variant mb-1">Financial Analysis</p>
            <h3 className="text-[24px] font-bold text-primary">Insights & Trends</h3>
          </div>
          <div className="flex gap-2 mb-8 bg-surface-dim p-1 rounded-xl w-fit">
            <button className="px-4 py-1.5 bg-background text-primary rounded-lg text-[14px] font-bold shadow-sm">Monthly</button>
            <button className="px-4 py-1.5 text-on-surface-variant rounded-lg text-[14px] font-bold">Quarterly</button>
            <button className="px-4 py-1.5 text-on-surface-variant rounded-lg text-[14px] font-bold">Yearly</button>
          </div>
          <div className="flex justify-between items-end mb-6">
             <div>
               <h4 className="text-[16px] font-bold text-primary mb-1">Spending Trend</h4>
               <p className="text-[13px] text-on-surface-variant">Comparing last 6 months</p>
             </div>
             <div className="text-right">
               <p className="text-[20px] font-bold text-primary">Rs. 4,280.00</p>
               <p className="text-[13px] font-bold text-success">↘ 12.4% vs last mo</p>
             </div>
          </div>
          <div className="flex-1 min-h-[150px]">
            <TrendChart data={trendData} />
          </div>
        </div>
      </div>

      {insights.insights.length > 0 && (
        <div className="bg-black rounded-3xl p-6 md:p-8 text-white shadow-soft">
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <Activity size={24} className="text-white" />
          </div>
          <h3 className="text-[20px] font-bold mb-2">
            AI Savings Engine
          </h3>
          <InsightsCard insights={insights.insights} suggestion={insights.suggestion} />
        </div>
      )}
    </div>
  );
}
