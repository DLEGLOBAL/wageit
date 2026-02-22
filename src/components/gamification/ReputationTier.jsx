import React from "react";
import { Crown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TIER_CONFIG = {
  bronze: { 
    label: "Bronze", 
    color: "from-orange-700 to-orange-500", 
    textColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    threshold: 0,
    perks: ["Basic trading", "Standard support"]
  },
  silver: { 
    label: "Silver", 
    color: "from-gray-400 to-gray-300", 
    textColor: "text-gray-300",
    bgColor: "bg-gray-300/10",
    threshold: 500,
    perks: ["5% bonus on wins", "Priority support"]
  },
  gold: { 
    label: "Gold", 
    color: "from-yellow-600 to-yellow-400", 
    textColor: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    threshold: 1500,
    perks: ["10% bonus on wins", "VIP support", "Reduced fees (1.5%)"]
  },
  platinum: { 
    label: "Platinum", 
    color: "from-cyan-400 to-blue-500", 
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    threshold: 3000,
    perks: ["15% bonus on wins", "Dedicated account manager", "Reduced fees (1%)"]
  },
  diamond: { 
    label: "Diamond", 
    color: "from-purple-400 to-pink-500", 
    textColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    threshold: 5000,
    perks: ["20% bonus on wins", "Exclusive events", "No fees"]
  }
};

export default function ReputationTier({ tier, reputation, showDetails = false }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  const nextTierKey = Object.keys(TIER_CONFIG).find(
    (key, idx, arr) => TIER_CONFIG[key].threshold > reputation && arr.indexOf(tier) < idx
  );
  const nextTier = nextTierKey ? TIER_CONFIG[nextTierKey] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${config.textColor}`}>{config.label} Tier</span>
            <Badge className={`${config.bgColor} ${config.textColor} border-0 text-[10px]`}>
              {reputation} pts
            </Badge>
          </div>
          {nextTier && (
            <p className="text-[10px] text-[var(--text-muted)]">
              {nextTier.threshold - reputation} pts to {nextTier.label}
            </p>
          )}
        </div>
      </div>

      {nextTier && (
        <div className="bg-[var(--surface-2)] rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--text-muted)]">Progress to {nextTier.label}</span>
            <span className="text-[10px] font-semibold">
              {Math.round((reputation / nextTier.threshold) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${nextTier.color} transition-all duration-500`}
              style={{ width: `${Math.min((reputation / nextTier.threshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <div className={`${config.bgColor} border border-[var(--border)] rounded-xl p-3`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-3 h-3 ${config.textColor}`} />
            <span className="text-xs font-semibold">Tier Perks</span>
          </div>
          <ul className="space-y-1">
            {config.perks.map((perk, i) => (
              <li key={i} className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <span className={config.textColor}>✓</span> {perk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}