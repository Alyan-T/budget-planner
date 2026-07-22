"use client";

import { useState } from "react";
import { TransactionInput } from "./TransactionInput";
import { ReceiptScanner } from "./ReceiptScanner";

export function TransactionEntry() {
  const [mode, setMode] = useState<"type" | "scan">("type");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex p-1 bg-surface-dim rounded-2xl">
        <button
          onClick={() => setMode("type")}
          className={`flex-1 py-2 rounded-xl text-[14px] font-bold transition-colors ${
            mode === "type" ? "bg-surface text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Type It
        </button>
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 py-2 rounded-xl text-[14px] font-bold transition-colors ${
            mode === "scan" ? "bg-surface text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Scan Receipt
        </button>
      </div>
      
      {mode === "type" ? <TransactionInput /> : <ReceiptScanner />}
    </div>
  );
}
