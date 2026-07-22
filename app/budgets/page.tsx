import { createClient } from "@/lib/supabase/server";
import { BudgetProgress } from "@/components/BudgetProgress";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const month = new Date();
  month.setDate(1);
  const monthStr = month.toISOString().slice(0, 10);

  const { data: budgets } = await supabase
    .from("budgets")
    .select("limit_amount, categories(id, name)")
    .eq("user_id", user!.id)
    .eq("month", monthStr);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, category_id")
    .eq("user_id", user!.id)
    .gte("occurred_at", monthStr);

  const spentByCategory: Record<string, number> = {};
  (transactions ?? []).forEach((t) => {
    if (t.category_id) {
      spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + t.amount;
    }
  });

  const rows = (budgets ?? []).map((b: any) => ({
    category: b.categories.name,
    spent: spentByCategory[b.categories.id] || 0,
    limit: b.limit_amount,
  }));

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-medium mb-4">This month's budgets</h3>
      {rows.length > 0 ? (
        <BudgetProgress budgets={rows} />
      ) : (
        <p className="text-gray-500 text-sm">
          No budgets set for this month yet. Add rows to the `budgets` table to get started.
        </p>
      )}
    </div>
  );
}
