import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Users, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

const TYPE_CONFIG = {
  skill_based: { icon: Zap, label: "Skill", color: "text-purple-400 bg-purple-500/10" },
  event_outcome: { icon: Trophy, label: "Event", color: "text-blue-400 bg-blue-500/10" },
  time_challenge: { icon: Clock, label: "Timed", color: "text-orange-400 bg-orange-500/10" },
};

const STATUS_COLORS = {
  open: "bg-[var(--accent)]/10 text-[var(--accent)]",
  active: "bg-blue-500/10 text-blue-400",
  pending_funding: "bg-yellow-500/10 text-yellow-400",
  disputed: "bg-red-500/10 text-red-400",
  completed: "bg-gray-500/10 text-gray-400",
};

export default function WagerCard({ wager, index = 0 }) {
  const typeConf = TYPE_CONFIG[wager.wager_type] || TYPE_CONFIG.skill_based;
  const TypeIcon = typeConf.icon;
  const stakeDisplay = (wager.stake_amount / 100).toFixed(2);
  const timeLeft = wager.expires_at ? moment(wager.expires_at).fromNow() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={createPageUrl(`WagerDetails?id=${wager.id}`)}>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 hover:border-[var(--accent)]/30 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-[var(--accent)] transition-colors">
                {wager.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                by {wager.creator_name || wager.creator_email?.split("@")[0]}
              </p>
            </div>
            <Badge className={`${STATUS_COLORS[wager.status] || ""} border-0 text-[10px] font-semibold uppercase tracking-wide ml-2 shrink-0`}>
              {wager.status?.replace("_", " ")}
            </Badge>
          </div>

          {wager.description && (
            <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{wager.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${typeConf.color}`}>
                <TypeIcon className="w-3 h-3" />
                {typeConf.label}
              </div>
              {wager.is_boosted && (
                <div className="flex items-center gap-1 text-[var(--accent)] text-xs">
                  <Flame className="w-3 h-3" /> Boosted
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-[var(--accent)]">${stakeDisplay}</div>
              {timeLeft && (
                <p className="text-[10px] text-[var(--text-muted)]">{timeLeft}</p>
              )}
            </div>
          </div>

          {wager.opponent_email && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Users className="w-3 h-3" />
              vs {wager.opponent_name || wager.opponent_email?.split("@")[0]}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}