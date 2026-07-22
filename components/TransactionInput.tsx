"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      setError("Couldn't parse that — try including an amount, e.g. \"$15 on gas\".");
      return;
    }
    setInput("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 relative">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Try "Spent $15 on gas" or "Got paid $2000 salary"'
        className="flex-1 border rounded-lg px-3 py-2"
      />
      <button
        disabled={loading}
        className="bg-gray-900 text-white rounded-lg px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Parsing..." : "Add"}
      </button>
      {error && <p className="text-red-600 text-sm absolute -bottom-6 left-0">{error}</p>}
    </form>
  );
}
