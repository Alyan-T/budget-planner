type Transaction = {
  id: string;
  amount: number;
  description: string | null;
  raw_input: string | null;
  occurred_at: string;
  categories: { name: string; type: string } | null;
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-gray-500 text-sm">No transactions yet.</p>;
  }

  return (
    <div className="divide-y">
      {transactions.map((t) => (
        <div key={t.id} className="flex justify-between items-center py-3">
          <div>
            <p className="font-medium">{t.description || t.raw_input}</p>
            <p className="text-sm text-gray-500">
              {t.categories?.name ?? "Uncategorized"} ·{" "}
              {new Date(t.occurred_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={
              t.categories?.type === "income" ? "text-green-600" : "text-gray-900"
            }
          >
            {t.categories?.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
