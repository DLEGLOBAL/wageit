import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trophy, Flame, UserPlus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

const ACTIVITY_ICONS = {
  wager_won: Trophy,
  achievement_unlocked: Flame,
  friend_added: UserPlus,
  level_up: TrendingUp,
};

const ACTIVITY_COLORS = {
  wager_won: "text-[var(--accent)]",
  achievement_unlocked: "text-orange-400",
  friend_added: "text-blue-400",
  level_up: "text-purple-400",
};

export default function ActivityFeed({ friendEmails = [] }) {
  const { data: activities = [] } = useQuery({
    queryKey: ["activity-feed", friendEmails],
    queryFn: async () => {
      if (friendEmails.length === 0) return [];
      const allActivities = await Promise.all(
        friendEmails.map(email => 
          base44.entities.ActivityFeed.filter({ user_email: email }, "-created_date", 20)
        )
      );
      return allActivities
        .flat()
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 50);
    },
    enabled: friendEmails.length > 0,
  });

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        No activity yet. Add friends to see their updates!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, i) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type] || Trophy;
        const color = ACTIVITY_COLORS[activity.activity_type] || "text-white";
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-start gap-3"
          >
            <div className={`w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{activity.username}</span>{" "}
                <span className="text-[var(--text-muted)]">{activity.description}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {moment(activity.created_date).fromNow()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}