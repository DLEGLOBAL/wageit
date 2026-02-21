import React from "react";

export default function StatCard({ label, value, icon: Icon, color = "text-[var(--accent)]" }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}