import { Tag } from "lucide-react";

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
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-outline-variant rounded-lg bg-surface-container-low/30">
        <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-3">
          <Tag className="text-secondary" size={24} />
        </div>
        <p className="text-[16px] font-medium text-on-surface">No transactions yet</p>
        <p className="text-[14px] text-on-surface-variant mt-1 max-w-[250px]">
          When you add your first transaction, it will show up here.
        </p>
      </div>
    );
  }

  // Group transactions by date
  const grouped: Record<string, typeof transactions> = {};
  transactions.forEach((t) => {
    const d = new Date(t.occurred_at);
    // e.g. "OCT 24"
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    
    // Check if it's today or yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let key = dateStr;
    if (d.toDateString() === today.toDateString()) {
      key = `TODAY, ${dateStr}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      key = `YESTERDAY, ${dateStr}`;
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} className="flex flex-col gap-3">
          <p className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase ml-2">{dateLabel}</p>
          <div className="flex flex-col gap-2">
            {items.map((t) => {
              const isIncome = t.categories?.type === "income";
              return (
                <div key={t.id} className="bg-surface rounded-2xl p-4 flex justify-between items-center shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isIncome ? 'bg-success-bg text-success' : 'bg-surface-dim text-on-surface-variant'}`}>
                      <Tag size={20} />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[15px] font-bold text-primary">
                        {t.description || t.raw_input}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[12px] text-on-surface-variant font-medium">
                          {new Date(t.occurred_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[12px] text-on-surface-variant font-medium">•</span>
                        <span className="text-[12px] text-on-surface-variant font-medium">
                          {t.categories?.name ?? "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[16px] font-bold tracking-tight ${
                      isIncome ? "text-success" : "text-primary"
                    }`}
                  >
                    {isIncome ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
