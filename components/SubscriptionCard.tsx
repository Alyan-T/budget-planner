"use client";

import { CalendarClock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SubscriptionCardProps = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  nextDueDate: string;
  categoryName: string | null;
  isActive: boolean;
};

export function SubscriptionCard({
  id,
  name,
  amount,
  frequency,
  nextDueDate,
  categoryName,
}: SubscriptionCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await fetch("/api/recurring-bills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dueText = "";
  let dueColorClass = "text-on-surface-variant";

  if (diffDays === 0) {
    dueText = "Due today";
    dueColorClass = "text-error";
  } else if (diffDays > 0) {
    dueText = `Due in ${diffDays} days`;
  } else {
    dueText = `Overdue by ${Math.abs(diffDays)} days`;
    dueColorClass = "text-error";
  }

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-soft flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-dim flex items-center justify-center text-primary shrink-0">
          <CalendarClock size={24} />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-primary">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] bg-surface-dim rounded-full px-2 py-0.5 text-primary capitalize">
              {frequency}
            </span>
            {categoryName && (
              <span className="text-[12px] text-on-surface-variant">{categoryName}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-bold text-primary">Rs. {amount.toLocaleString()}</p>
          <p className={`text-[12px] ${dueColorClass}`}>{dueText}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-error hover:bg-error-bg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          aria-label="Delete subscription"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
