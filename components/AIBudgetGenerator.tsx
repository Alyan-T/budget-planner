"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function AIBudgetGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/generate-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || `Server responded with status ${res.status}`);
      return;
    }

    setPrompt("");
    router.refresh();
  }

  return (
    <div className="bg-black rounded-3xl p-6 md:p-8 text-white shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-white" size={24} />
        <h3 className="text-[20px] font-bold">AI Budget Generator</h3>
      </div>
      <p className="text-[14px] text-zinc-400 mb-6">
        Describe an upcoming trip, project, or life event. Our AI will instantly research, categorize, and draft a realistic budget plan for you.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Planning a 2-week trip to Europe"
          className="flex-1 h-[56px] px-6 bg-zinc-900 border border-zinc-800 rounded-xl text-[16px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white transition-all"
        />
        <button
          disabled={loading}
          className="h-[56px] px-8 bg-white text-black rounded-xl text-[16px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            "Generate Plan"
          )}
        </button>
      </form>
      {error && <p className="text-error text-[13px] mt-3 bg-error/20 px-3 py-2 rounded-md">{error}</p>}
    </div>
  );
}
