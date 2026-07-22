"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSubscriptionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !nextDueDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recurring-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: Number(amount),
          frequency,
          nextDueDate,
        }),
      });
      if (res.ok) {
        setName("");
        setAmount("");
        setFrequency("monthly");
        setNextDueDate("");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 shadow-soft flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-primary mb-2">Add New Subscription</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Subscription Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-surface-dim rounded-xl h-[48px] px-4 text-[14px] text-primary placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20"
        />
        
        <input
          type="number"
          placeholder="Amount (Rs.)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          className="bg-surface-dim rounded-xl h-[48px] px-4 text-[14px] text-primary placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20"
        />

        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="bg-surface-dim rounded-xl h-[48px] px-4 text-[14px] text-primary outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <input
          type="date"
          value={nextDueDate}
          onChange={(e) => setNextDueDate(e.target.value)}
          required
          className="bg-surface-dim rounded-xl h-[48px] px-4 text-[14px] text-primary outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 bg-primary text-on-primary rounded-xl h-[48px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add Subscription"}
      </button>
    </form>
  );
}
