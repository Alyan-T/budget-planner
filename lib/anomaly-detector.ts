import type { TransactionDoc, BudgetDoc, CategoryDoc } from "./models";

export type AnomalyAlert = {
  id: string;
  type: "spike" | "velocity" | "unusual";
  severity: "warning" | "critical";
  message: string;
  categoryName: string;
  amount: number;
};

export function detectAnomalies(
  transactions: TransactionDoc[],
  budgets: BudgetDoc[],
  categories: CategoryDoc[],
  daysInMonth: number,
  daysSoFar: number
): AnomalyAlert[] {
  const alerts: AnomalyAlert[] = [];

  // Group transactions by category to calculate spending per category
  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (!t.categoryId) continue;
    const cid = t.categoryId.toString();
    spentByCategory.set(cid, (spentByCategory.get(cid) || 0) + t.amount);
  }

  // Calculate average per category over the last 30 days
  const categoryAvg30Days = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const t of transactions) {
    if (!t.categoryId) continue;
    const cid = t.categoryId.toString();
    categoryAvg30Days.set(cid, (categoryAvg30Days.get(cid) || 0) + t.amount);
    categoryCounts.set(cid, (categoryCounts.get(cid) || 0) + 1);
  }

  const avgAmounts = new Map<string, number>();
  for (const [cid, total] of categoryAvg30Days.entries()) {
    const count = categoryCounts.get(cid) || 1;
    avgAmounts.set(cid, total / count);
  }

  // Determine seven days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Velocity
  for (const budget of budgets) {
    const cid = budget.categoryId.toString();
    const spent = spentByCategory.get(cid) || 0;
    const limit = budget.limitAmount;
    if (limit <= 0) continue;

    const ratio = spent / limit;
    const expectedRatio = daysSoFar / daysInMonth;
    const diff = ratio - expectedRatio;

    if (diff > 0.20) {
      const category = categories.find(c => c._id.toString() === cid);
      const catName = category ? category.name : "Unknown";
      const severity = diff > 0.40 ? "critical" : "warning";
      
      alerts.push({
        id: `vel-${cid}`,
        type: "velocity",
        severity,
        message: `Spending velocity in ${catName} is high. You've used ${Math.round(ratio * 100)}% of your budget, but only ${Math.round(expectedRatio * 100)}% of the month has passed.`,
        categoryName: catName,
        amount: spent
      });
    }
  }

  // 2. Spike
  for (const t of transactions) {
    if (!t.categoryId) continue;
    const d = new Date(t.occurredAt);
    if (d >= sevenDaysAgo) {
      const cid = t.categoryId.toString();
      const avg = avgAmounts.get(cid) || 0;
      if (avg > 0 && t.amount > avg * 2) {
        const category = categories.find(c => c._id.toString() === cid);
        const catName = category ? category.name : "Unknown";
        
        const spikeId = `spike-${t._id.toString()}`;
        
        alerts.push({
          id: spikeId,
          type: "spike",
          severity: "warning",
          message: `Unusually large transaction of $${t.amount} in ${catName} (average is $${Math.round(avg)}).`,
          categoryName: catName,
          amount: t.amount
        });
      }
    }
  }

  return alerts;
}
