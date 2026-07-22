"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Goal = {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
};

export function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();
  const [amountToAdd, setAmountToAdd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
  const isMet = goal.currentAmount >= goal.targetAmount;

  async function handleAddFunds(e: React.FormEvent) {
    e.preventDefault();
    if (!amountToAdd) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/savings-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal._id, amountToAdd: parseFloat(amountToAdd) })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add funds");
      } else {
        setAmountToAdd("");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-soft flex flex-col gap-4 relative">
      {isMet && (
        <div className="absolute -top-3 -right-3 bg-success text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-soft">
          Goal Met! 🎉
        </div>
      )}
      <div className="flex justify-between items-start">
        <h3 className="text-primary font-bold text-lg">{goal.name}</h3>
        <div className="text-right">
          <p className="text-sm text-on-surface-variant">Target</p>
          <p className="text-primary font-bold">Rs. {goal.targetAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Progress</span>
            <span className="font-bold text-primary">{percentage}%</span>
          </div>
          <span className="text-primary text-xs font-medium">
            Rs. {goal.currentAmount.toFixed(2)} / Rs. {goal.targetAmount.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-surface-dim rounded-full h-3 overflow-hidden">
          <div className="bg-success h-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
        {error && <p className="text-error text-xs mt-1">{error}</p>}
      </div>

      {!isMet && (
        <form onSubmit={handleAddFunds} className="mt-2 flex flex-col xl:flex-row gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            placeholder="Amount to add"
            className="flex-1 min-w-0 w-full bg-surface-dim rounded-2xl px-4 py-2 text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !amountToAdd}
            className="shrink-0 bg-primary text-on-primary px-4 py-2 rounded-2xl font-bold shadow-soft hover:opacity-90 disabled:opacity-50 text-sm whitespace-nowrap text-center"
          >
            {loading ? "..." : "Add Funds"}
          </button>
        </form>
      )}
    </div>
  );
}
