"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus } from "lucide-react";

export function TransactionInput() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/parse-transaction", {
      method: "POST",
      body: JSON.stringify({ input }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Couldn't parse that — try including an amount, e.g. \"Rs. 1500 on gas\".");
      return;
    }
    setInput("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Sparkles size={18} className="text-on-surface-variant" />
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Try "Spent Rs. 1500 on gas" or "Got paid Rs. 200000"'
            className="w-full h-[48px] pl-11 pr-4 bg-surface-dim rounded-2xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <button
          disabled={loading}
          className="h-[48px] md:w-[120px] bg-primary text-on-primary rounded-2xl text-[14px] font-bold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={18} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-error text-[14px] mt-1 bg-error-bg px-3 py-2 rounded-md">{error}</p>}
    </form>
  );
}
