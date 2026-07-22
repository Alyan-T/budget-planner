"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import type { AnomalyAlert } from "@/lib/anomaly-detector";

export default function AnomalyAlerts() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnomalies() {
      try {
        const res = await fetch("/api/anomalies");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error("Failed to fetch anomalies", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnomalies();
  }, []);

  if (loading || alerts.length === 0) return null;

  const dismiss = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-3 mt-6">
      {alerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const bgClass = isCritical ? "bg-[rgba(239,68,68,0.1)]" : "bg-yellow-900/30";
        const textClass = isCritical ? "text-error" : "text-yellow-400";
        
        return (
          <div key={alert.id} className={`${bgClass} rounded-2xl p-4 flex items-start gap-3 shadow-soft`}>
            <div className={`mt-0.5 ${textClass}`}>
              <TriangleAlert size={20} />
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${textClass} mb-1 capitalize`}>{alert.type} Alert</h4>
              <p className="text-primary text-sm opacity-90">{alert.message}</p>
            </div>
            <button 
              onClick={() => dismiss(alert.id)}
              className="text-on-surface-variant hover:text-primary transition-colors mt-0.5"
            >
              <X size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
