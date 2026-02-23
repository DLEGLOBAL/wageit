import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, subtitle, backButton, rightAction }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 px-4 py-4 sticky top-0 z-40 backdrop-blur-xl border-b border-[var(--border)]" style={{ paddingTop: 'calc(1rem + var(--safe-area-top))' }}>
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backButton &&
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-[var(--surface)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          }
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>);

}