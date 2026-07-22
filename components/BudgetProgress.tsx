type Budget = {
  category: string;
  spent: number;
  limit: number;
};

export function BudgetProgress({ budgets }: { budgets: Budget[] }) {
  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const pct = Math.min((b.spent / b.limit) * 100, 100);
        const over = b.spent > b.limit;
        return (
          <div key={b.category}>
            <div className="flex justify-between text-sm mb-1">
              <span>{b.category}</span>
              <span className={over ? "text-red-600" : "text-gray-500"}>
                ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${over ? "bg-red-500" : "bg-gray-900"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
