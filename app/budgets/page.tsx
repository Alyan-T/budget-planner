import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import type { BudgetDoc, CategoryDoc, TransactionDoc, GeneratedPlanDoc } from "@/lib/models";
import { BudgetProgress } from "@/components/BudgetProgress";
import { SetBudgetForm } from "@/components/SetBudgetForm";
import { AIBudgetGenerator } from "@/components/AIBudgetGenerator";
import { CategoryRules } from "@/components/CategoryRules";

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const userId = new ObjectId(user.userId);

  const db = await getDb();

  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysSoFar = now.getDate();

  const budgets = await db
    .collection<BudgetDoc>("budgets")
    .find({ userId, month })
    .toArray();

  const categoryIds = budgets.map((b) => b.categoryId);
  const categories = await db
    .collection<CategoryDoc>("categories")
    .find({ _id: { $in: categoryIds } })
    .toArray();
  const categoryById = new Map(categories.map((c) => [c._id.toString(), c]));

  const transactions = await db
    .collection<TransactionDoc>("transactions")
    .find({ userId, occurredAt: { $gte: month } })
    .toArray();

  const spentByCategory: Record<string, number> = {};
  let totalBudget = 0;
  let totalSpent = 0;

  transactions.forEach((t) => {
    if (t.categoryId) {
      const key = t.categoryId.toString();
      spentByCategory[key] = (spentByCategory[key] || 0) + t.amount;
      totalSpent += t.amount;
    }
  });

  const rows = budgets.map((b) => {
    const catId = b.categoryId.toString();
    totalBudget += b.limitAmount;
    return {
      category: categoryById.get(catId)?.name ?? "Unknown",
      spent: spentByCategory[catId] || 0,
      limit: b.limitAmount,
    };
  });

  const generatedPlans = await db
    .collection<GeneratedPlanDoc>("generated_plans")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  const totalPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Total Monthly Budget Hero */}
      <div className="bg-background flex flex-col gap-6 relative">
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-bold tracking-widest uppercase text-on-surface-variant">Total Monthly Budget</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-[32px] md:text-[40px] font-bold tracking-tight text-primary">
              Rs. {totalBudget.toFixed(2)}
            </p>
            <span className="text-[12px] md:text-[14px] w-fit font-bold text-success bg-success-bg px-3 py-1 rounded-full">
              {totalPct.toFixed(0)}% Spent
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full ${totalPct > 100 ? "bg-error" : "bg-primary"}`}
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[13px] text-on-surface-variant font-medium mt-2">
          <span>Rs. {totalSpent.toFixed(0)} spent</span>
          <span>{daysInMonth - daysSoFar} days remaining</span>
        </div>
      </div>

      <AIBudgetGenerator />

      {generatedPlans.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[18px] font-bold text-primary px-2">Your AI Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedPlans.map((plan) => (
              <div key={plan._id.toString()} className="bg-surface rounded-2xl p-6 shadow-soft">
                <h4 className="text-[16px] font-bold text-primary capitalize mb-4">{plan.title}</h4>
                <div className="flex flex-col gap-2">
                  {plan.categories.map((cat, i) => (
                    <div key={i} className="flex justify-between items-center text-[14px]">
                      <span className="text-on-surface-variant">{cat.name}</span>
                      <span className="font-bold text-primary">Rs. {cat.limitAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-surface-dim flex justify-between items-center text-[15px] font-black text-primary">
                  <span>Total Est.</span>
                  <span>Rs. {plan.categories.reduce((acc, cat) => acc + cat.limitAmount, 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-soft">
        <h3 className="text-[20px] font-bold text-primary mb-2">Custom Categories</h3>
        <p className="text-[14px] text-on-surface-variant mb-6">Create or update a budget limit manually.</p>
        <SetBudgetForm />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-[18px] font-bold text-primary mb-2 px-2">Category Breakdown</h3>
        {rows.length === 0 ? (
          <p className="text-on-surface-variant text-[14px]">No budgets set yet. Use the form above to add one!</p>
        ) : (
          <BudgetProgress budgets={rows} daysInMonth={daysInMonth} daysSoFar={daysSoFar} />
        )}
      </div>

      <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-soft">
        <h3 className="text-[20px] font-bold text-primary mb-2">Auto-Categorize Rules</h3>
        <p className="text-[14px] text-on-surface-variant mb-6">Define rules to automatically categorize transactions by keyword.</p>
        <CategoryRules />
      </div>

    </div>
  );
}
