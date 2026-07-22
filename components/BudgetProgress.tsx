import { Pencil } from "lucide-react";

type Budget = {
  category: string;
  spent: number;
  limit: number;
};

type BudgetProgressProps = {
  budgets: Budget[];
  daysInMonth: number;
  daysSoFar: number;
};

export function BudgetProgress({ budgets, daysInMonth, daysSoFar }: BudgetProgressProps) {
  if (budgets.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {budgets.map((b) => {
        const actualPct = (b.spent / b.limit) * 100;
        const expectedPct = (daysSoFar / daysInMonth) * 100;
        
        let pace = "On Track";
        let badgeClass = "bg-yellow-900/30 text-yellow-400";
        let barClass = "bg-yellow-400";
        
        if (actualPct < expectedPct - 10) {
          pace = "Ahead";
          badgeClass = "bg-success-bg text-success";
          barClass = "bg-success";
        } else if (actualPct > expectedPct + 10) {
          pace = "Over Pace";
          badgeClass = "bg-error-bg text-error";
          barClass = "bg-error";
        }

        const clampedActualPct = Math.min(actualPct, 100);
        const dailyBudget = b.limit / daysInMonth;
        const remaining = Math.max(0, b.limit - b.spent);
        const daysLeft = daysInMonth - daysSoFar;

        return (
          <div key={b.category} className="bg-surface rounded-3xl p-6 shadow-soft flex flex-col">
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-dim rounded-2xl flex items-center justify-center">
                   <div className="w-5 h-5 bg-surface-bright rounded-sm" />
                </div>
                <h4 className="text-[18px] font-bold text-primary">{b.category}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${badgeClass}`}>
                  {pace}
                </span>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <Pencil size={18} />
                </button>
              </div>
            </div>

            {/* Middle: progress bar */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="h-2.5 bg-surface-dim rounded-full overflow-hidden">
                <div
                  className={`h-full ${barClass}`}
                  style={{ width: `${clampedActualPct}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[14px] text-on-surface-variant">
                <span>Rs. {b.spent.toFixed(0)} spent</span>
                <span>Rs. {b.spent.toFixed(0)} / Rs. {b.limit.toFixed(0)}</span>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end border-t border-surface-dim pt-4 mt-auto">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold tracking-widest uppercase text-on-surface-variant mb-1">Remaining</span>
                <span className="text-[16px] font-bold text-primary">Rs. {remaining.toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-bold tracking-widest uppercase text-on-surface-variant mb-1">{daysLeft} days left</span>
                <span className="text-[14px] font-medium text-on-surface-variant">Rs. {dailyBudget.toFixed(0)}/day</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
