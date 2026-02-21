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

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async () => {
      const allProfiles = await base44.entities.UserProfile.list('-wins', 100);
      return allProfiles
        .filter(p => !p.is_banned && p.completed_wagers > 0)
        .sort((a, b) => {
          const winRateA = a.completed_wagers > 0 ? (a.wins / a.completed_wagers) : 0;
          const winRateB = b.completed_wagers > 0 ? (b.wins / b.completed_wagers) : 0;
          return (b.wins + winRateB) - (a.wins + winRateA);
        })
        .slice(0, 50);
    },
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
        {!isLoading && profiles.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-6">
            {/* 2nd Place */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] border-2 border-gray-400 overflow-hidden mb-2">
                {profiles[1]?.avatar_url ? (
                  <img src={profiles[1].avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                    {(profiles[1]?.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <Medal className="w-6 h-6 text-gray-300 mb-1" />
              <p className="text-xs font-medium truncate max-w-full">{profiles[1]?.username}</p>
              <p className="text-xs text-[var(--text-muted)]">{profiles[1]?.wins}W</p>
              <div className="w-full h-20 bg-gradient-to-t from-gray-400/20 to-gray-400/10 rounded-t-xl mt-2 border-t-2 border-gray-400" />
            </motion.div>

            {/* 1st Place */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--surface-2)] border-4 border-yellow-400 overflow-hidden mb-2">
                {profiles[0]?.avatar_url ? (
                  <img src={profiles[0].avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-yellow-400">
                    {(profiles[0]?.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <Crown className="w-7 h-7 text-yellow-400 mb-1" />
              <p className="text-sm font-bold truncate max-w-full">{profiles[0]?.username}</p>
              <p className="text-xs text-[var(--accent)]">{profiles[0]?.wins}W</p>
              <div className="w-full h-28 bg-gradient-to-t from-yellow-500/20 to-yellow-500/10 rounded-t-xl mt-2 border-t-4 border-yellow-400" />
            </motion.div>

            {/* 3rd Place */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] border-2 border-orange-400 overflow-hidden mb-2">
                {profiles[2]?.avatar_url ? (
                  <img src={profiles[2].avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-orange-400">
                    {(profiles[2]?.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <Medal className="w-5 h-5 text-orange-400 mb-1" />
              <p className="text-xs font-medium truncate max-w-full">{profiles[2]?.username}</p>
              <p className="text-xs text-[var(--text-muted)]">{profiles[2]?.wins}W</p>
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
            profiles.map((profile, index) => {
              const winRate = profile.completed_wagers > 0 ? ((profile.wins / profile.completed_wagers) * 100).toFixed(1) : 0;
              const isCurrentUser = user?.email === profile.user_email;
              
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${getRankBg(index)} ${isCurrentUser ? "ring-2 ring-[var(--accent)]" : ""}`}
                >
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {getRankIcon(index) || (
                      <span className="text-sm font-bold text-[var(--text-muted)]">#{index + 1}</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] overflow-hidden shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">
                        {(profile.username || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile.username}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{profile.wins}W / {profile.losses}L</span>
                      <span>•</span>
                      <span>{winRate}% win rate</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] border-0 text-xs">
                      {profile.reputation_score}
                    </Badge>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}