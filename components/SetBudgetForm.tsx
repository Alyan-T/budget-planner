"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function SetBudgetForm() {
  const [categoryName, setCategoryName] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName.trim() || !limitAmount.trim()) return;

    const limit = parseFloat(limitAmount);
    if (isNaN(limit) || limit <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryName, limitAmount: limit }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Failed to set budget.");
      return;
    }

    setCategoryName("");
    setLimitAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category (e.g. Groceries)"
          className="flex-1 h-[48px] px-4 bg-surface-dim rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        <input
          type="number"
          step="0.01"
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          placeholder="Limit (e.g. 500)"
          className="w-full md:w-[150px] h-[48px] px-4 bg-surface-dim rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        <button
          disabled={loading}
          className="h-[48px] px-6 bg-primary text-on-primary rounded-xl text-[14px] font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? (
             <div className="w-4 h-4 border-2 border-on-surface-inverse/30 border-t-on-surface-inverse rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={16} />
              Set Budget
            </>
          )}
        </button>
      </div>
      {error && <p className="text-error text-[13px]">{error}</p>}
    </form>
  );
}
