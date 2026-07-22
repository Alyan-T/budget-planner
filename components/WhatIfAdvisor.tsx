"use client";

import { useState } from "react";
import { Send, CheckCircle2, XCircle } from "lucide-react";

type AdvisorResponse = {
  answer: string;
  canAfford: boolean;
};

export default function WhatIfAdvisor() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const res = await fetch("/api/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        setQuestion("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to ask advisor");
      }
    } catch (err: any) {
      console.error("Failed to ask advisor", err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {error && (
        <div className="bg-error-bg text-error rounded-3xl p-6 shadow-soft font-bold">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-surface rounded-3xl p-6 shadow-soft flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {response.canAfford ? (
              <span className="bg-green-900/30 text-success px-3 py-1 rounded-full text-[13px] font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Yes
              </span>
            ) : (
              <span className="bg-error-bg text-error px-3 py-1 rounded-full text-[13px] font-bold flex items-center gap-2">
                <XCircle size={16} /> No
              </span>
            )}
          </div>
          <p className="text-primary text-[15px] leading-relaxed">
            {response.answer}
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-surface rounded-3xl p-6 shadow-soft flex justify-center items-center h-32">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 relative mt-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Can I afford a new 50,000 PKR laptop this month?"
          className="w-full bg-surface-dim rounded-2xl text-[14px] text-primary placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary px-6 py-4"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2 top-2 bottom-2 bg-primary text-on-primary rounded-xl px-4 flex items-center justify-center shadow-soft hover:opacity-90 disabled:opacity-50 z-10"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
