import React from "react";
import { Trophy, Flame, Crown, Star, Target, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const ACHIEVEMENT_CONFIG = {
  first_wager: { icon: Target, label: "First Wager", color: "text-blue-400 bg-blue-500/10" },
  first_win: { icon: Trophy, label: "First Win", color: "text-[var(--accent)] bg-[var(--accent)]/10" },
  ten_wins: { icon: Trophy, label: "10 Wins", color: "text-[var(--accent)] bg-[var(--accent)]/10" },
  fifty_wins: { icon: Trophy, label: "50 Wins", color: "text-yellow-400 bg-yellow-500/10" },
  hundred_wins: { icon: Trophy, label: "100 Wins", color: "text-purple-400 bg-purple-500/10" },
  win_streak_3: { icon: Flame, label: "3 Win Streak", color: "text-orange-400 bg-orange-500/10" },
  win_streak_5: { icon: Flame, label: "5 Win Streak", color: "text-red-400 bg-red-500/10" },
  win_streak_10: { icon: Flame, label: "10 Win Streak", color: "text-pink-400 bg-pink-500/10" },
  high_roller: { icon: Crown, label: "High Roller", color: "text-yellow-400 bg-yellow-500/10" },
  big_spender: { icon: Crown, label: "Big Spender", color: "text-purple-400 bg-purple-500/10" },
  verified_user: { icon: Shield, label: "Verified", color: "text-blue-400 bg-blue-500/10" },
  perfect_record: { icon: Star, label: "Perfect Record", color: "text-cyan-400 bg-cyan-500/10" },
  fearless: { icon: Target, label: "Fearless", color: "text-red-400 bg-red-500/10" },
  precision_master: { icon: Target, label: "Precision Master", color: "text-green-400 bg-green-500/10" },
};

export default function AchievementBadges({ achievements = [] }) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Achievements</p>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement, i) => {
          const config = ACHIEVEMENT_CONFIG[achievement.achievement_type];
          if (!config) return null;
          const Icon = config.icon;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Badge className={`${config.color} border-0 flex items-center gap-1.5 px-3 py-1.5`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{config.label}</span>
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}