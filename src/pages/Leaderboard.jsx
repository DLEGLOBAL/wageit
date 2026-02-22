import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import { Trophy, Medal, Crown, TrendingUp, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [period, setPeriod] = useState("all_time");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const entries = await base44.entities.Leaderboard.filter({ period }, "rank", 100);
      if (entries.length === 0) {
        // Fallback to profiles if leaderboard not populated yet
        const allProfiles = await base44.entities.UserProfile.list('-wins', 100);
        return allProfiles
          .filter(p => !p.is_banned && p.completed_wagers > 0)
          .slice(0, 50)
          .map((p, i) => ({
            rank: i + 1,
            user_email: p.user_email,
            username: p.username,
            avatar_url: p.avatar_url,
            wins: p.wins,
            losses: p.losses,
            completed_wagers: p.completed_wagers,
            reputation_score: p.reputation_score,
            total_won: 0,
            win_rate: p.completed_wagers > 0 ? (p.wins / p.completed_wagers) * 100 : 0,
            streak: p.current_win_streak || 0
          }));
      }
      return entries;
    },
    refetchInterval: 30000,
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getRankBg = (index) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30";
    if (index === 1) return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30";
    if (index === 2) return "bg-gradient-to-r from-orange-400/10 to-orange-500/10 border-orange-400/30";
    return "bg-[var(--surface)] border-[var(--border)]";
  };

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader 
        title="Leaderboard" 
        subtitle="Top challengers"
        rightAction={
          <Trophy className="w-5 h-5 text-[var(--accent)]" />
        }
      />

      <div className="px-4 py-6 space-y-4">
        {/* Period Selector */}
        <Tabs value={period} onValueChange={setPeriod} className="w-full">
          <TabsList className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <TabsTrigger value="all_time" className="flex-1 text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              All Time
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              This Month
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              This Week
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Podium */}
        {!isLoading && leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-6">
            {/* 2nd Place */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] border-2 border-gray-400 overflow-hidden mb-2 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-400">
                  {(leaderboard[1]?.username || "?")[0].toUpperCase()}
                </span>
              </div>
              <Medal className="w-6 h-6 text-gray-300 mb-1" />
              <p className="text-xs font-medium truncate max-w-full">{leaderboard[1]?.username}</p>
              <p className="text-xs text-[var(--text-muted)]">${(leaderboard[1]?.total_won / 100).toFixed(0)}</p>
              {leaderboard[1]?.streak > 0 && <p className="text-[10px] text-orange-400">🔥 {leaderboard[1].streak}</p>}
              <div className="w-full h-20 bg-gradient-to-t from-gray-400/20 to-gray-400/10 rounded-t-xl mt-2 border-t-2 border-gray-400" />
            </motion.div>

            {/* 1st Place */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--surface-2)] border-4 border-yellow-400 overflow-hidden mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-yellow-400">
                  {(leaderboard[0]?.username || "?")[0].toUpperCase()}
                </span>
              </div>
              <Crown className="w-7 h-7 text-yellow-400 mb-1" />
              <p className="text-sm font-bold truncate max-w-full">{leaderboard[0]?.username}</p>
              <p className="text-xs text-[var(--accent)]">${(leaderboard[0]?.total_won / 100).toFixed(0)}</p>
              {leaderboard[0]?.streak > 0 && <p className="text-[10px] text-orange-400">🔥 {leaderboard[0].streak}</p>}
              <div className="w-full h-28 bg-gradient-to-t from-yellow-500/20 to-yellow-500/10 rounded-t-xl mt-2 border-t-4 border-yellow-400" />
            </motion.div>

            {/* 3rd Place */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] border-2 border-orange-400 overflow-hidden mb-2 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-400">
                  {(leaderboard[2]?.username || "?")[0].toUpperCase()}
                </span>
              </div>
              <Medal className="w-5 h-5 text-orange-400 mb-1" />
              <p className="text-xs font-medium truncate max-w-full">{leaderboard[2]?.username}</p>
              <p className="text-xs text-[var(--text-muted)]">${(leaderboard[2]?.total_won / 100).toFixed(0)}</p>
              {leaderboard[2]?.streak > 0 && <p className="text-[10px] text-orange-400">🔥 {leaderboard[2].streak}</p>}
              <div className="w-full h-16 bg-gradient-to-t from-orange-400/20 to-orange-400/10 rounded-t-xl mt-2 border-t-2 border-orange-400" />
            </motion.div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="space-y-2">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="bg-[var(--surface)] rounded-xl h-16 animate-pulse" />
            ))
          ) : (
            leaderboard.map((entry, index) => {
              const isCurrentUser = user?.email === entry.user_email;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(index)} ${isCurrentUser ? "ring-2 ring-[var(--accent)]" : ""}`}
                >
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {getRankIcon(index) || (
                      <span className="text-sm font-bold text-[var(--text-muted)]">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] overflow-hidden shrink-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--text-muted)]">
                      {(entry.username || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.username}
                      {isCurrentUser && <span className="ml-1 text-xs text-[var(--accent)]">(You)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>${(entry.total_won / 100).toFixed(0)}</span>
                      <span>•</span>
                      <span>{entry.win_rate.toFixed(1)}%</span>
                      {entry.streak > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-orange-400">🔥 {entry.streak}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {entry.reputation_score && (
                    <div className="text-right shrink-0">
                      <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] border-0 text-xs">
                        {entry.reputation_score}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}