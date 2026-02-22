import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Target, DollarSign, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsAnalytics({ userEmail }) {
  const { data: wagers = [] } = useQuery({
    queryKey: ["user-wagers-analytics", userEmail],
    queryFn: async () => {
      const created = await base44.entities.Wager.filter({ creator_email: userEmail, status: "completed" });
      const opponent = await base44.entities.Wager.filter({ opponent_email: userEmail, status: "completed" });
      return [...created, ...opponent];
    },
    enabled: !!userEmail,
  });

  // Analytics by wager type
  const typeStats = wagers.reduce((acc, w) => {
    const type = w.wager_type;
    if (!acc[type]) acc[type] = { wins: 0, losses: 0, total: 0 };
    acc[type].total++;
    if (w.winner_email === userEmail) {
      acc[type].wins++;
    } else {
      acc[type].losses++;
    }
    return acc;
  }, {});

  // Calculate average stake
  const totalWon = wagers.filter(w => w.winner_email === userEmail).reduce((sum, w) => sum + w.stake_amount, 0);
  const totalLost = wagers.filter(w => w.winner_email !== userEmail).reduce((sum, w) => sum + w.stake_amount, 0);
  const avgWon = wagers.filter(w => w.winner_email === userEmail).length > 0 
    ? totalWon / wagers.filter(w => w.winner_email === userEmail).length 
    : 0;
  const avgLost = wagers.filter(w => w.winner_email !== userEmail).length > 0
    ? totalLost / wagers.filter(w => w.winner_email !== userEmail).length
    : 0;

  // Performance trend (last 10 wagers)
  const recentWagers = wagers
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);
  const recentWins = recentWagers.filter(w => w.winner_email === userEmail).length;
  const recentWinRate = recentWagers.length > 0 ? (recentWins / recentWagers.length) * 100 : 0;

  const typeIcons = {
    skill_based: Target,
    event_outcome: Award,
    time_challenge: TrendingUp,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
        Performance Analytics
      </h3>

      {/* Average Stakes */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[var(--surface)] border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[var(--text-muted)]">Avg Win</span>
          </div>
          <p className="text-xl font-bold text-green-400">${(avgWon / 100).toFixed(2)}</p>
        </Card>
        <Card className="bg-[var(--surface)] border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-red-400" />
            <span className="text-xs text-[var(--text-muted)]">Avg Loss</span>
          </div>
          <p className="text-xl font-bold text-red-400">${(avgLost / 100).toFixed(2)}</p>
        </Card>
      </div>

      {/* By Type Stats */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">Performance by Type</p>
        {Object.entries(typeStats).map(([type, stats], i) => {
          const Icon = typeIcons[type] || Target;
          const winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{stats.total} wagers</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-400">{stats.wins}W</span>
                <span className="text-red-400">{stats.losses}L</span>
                <span className="text-[var(--accent)]">{winRate.toFixed(1)}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent)] to-green-400"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Form */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Recent Form (Last 10)</span>
          <span className="text-xs text-[var(--accent)]">{recentWinRate.toFixed(0)}% win rate</span>
        </div>
        <div className="flex gap-1">
          {recentWagers.map((w, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded ${
                w.winner_email === userEmail ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
              title={w.winner_email === userEmail ? 'Win' : 'Loss'}
            />
          ))}
          {recentWagers.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">No recent wagers</p>
          )}
        </div>
      </div>
    </div>
  );
}