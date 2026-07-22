"use client";

import { Download } from "lucide-react";

export function ExportButton() {
  const handleExport = () => {
    const a = document.createElement("a");
    a.href = "/api/export";
    a.click();
  };

  return (
    <button
      onClick={handleExport}
      className="bg-surface-dim text-on-surface-variant hover:bg-surface-bright rounded-full px-4 py-2 text-[14px] font-bold flex items-center gap-2"
    >
      <Download size={18} />
      Export CSV
    </button>
  );
}
