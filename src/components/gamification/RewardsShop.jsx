import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Trophy, Crown, Zap, Gift, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const REWARD_ICONS = {
  cosmetic: Crown,
  feature: Zap,
  badge: Trophy,
  boost: Sparkles
};

export default function RewardsShop({ user }) {
  const qc = useQueryClient();

  const { data: points = { points: 0 } } = useQuery({
    queryKey: ["points", user?.email],
    queryFn: async () => {
      const p = await base44.entities.Points.filter({ user_email: user.email });
      return p[0] || { points: 0 };
    },
    enabled: !!user?.email
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ["rewards"],
    queryFn: () => base44.entities.Reward.filter({ is_active: true })
  });

  const { data: claimed = [] } = useQuery({
    queryKey: ["claimed", user?.email],
    queryFn: () => base44.entities.RewardClaim.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const claimReward = useMutation({
    mutationFn: async (reward) => {
      if (points.points < reward.cost_points) {
        throw new Error("Not enough points!");
      }

      // Deduct points
      await base44.entities.Points.update(points.id, {
        points: points.points - reward.cost_points,
        total_spent: (points.total_spent || 0) + reward.cost_points
      });

      // Create claim
      await base44.entities.RewardClaim.create({
        user_email: user.email,
        reward_id: reward.id,
        reward_name: reward.name,
        points_spent: reward.cost_points,
        claimed_at: new Date().toISOString()
      });

      // Notification
      await base44.entities.Notification.create({
        user_email: user.email,
        title: "🎁 Reward Claimed!",
        message: `You unlocked: ${reward.name}`,
        type: "system"
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["points"] });
      qc.invalidateQueries({ queryKey: ["claimed"] });
      toast.success("Reward unlocked!");
    },
    onError: (err) => toast.error(err.message)
  });

  const hasClaimed = (rewardId) => claimed.some(c => c.reward_id === rewardId);

  return (
    <div className="space-y-4">
      {/* Points Balance */}
      <div className="bg-gradient-to-r from-[var(--accent)]/20 to-purple-500/20 border border-[var(--accent)]/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Your Balance</p>
            <p className="text-3xl font-bold text-[var(--accent)]">{points.points || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">points</p>
          </div>
          <Sparkles className="w-12 h-12 text-[var(--accent)]" />
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((reward, i) => {
          const Icon = REWARD_ICONS[reward.reward_type] || Gift;
          const claimed = hasClaimed(reward.id);
          const canAfford = points.points >= reward.cost_points;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[var(--surface)] border rounded-xl p-4 ${
                claimed ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)]"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                claimed ? "bg-[var(--accent)]/20" : "bg-[var(--surface-2)]"
              }`}>
                <Icon className={`w-6 h-6 ${claimed ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
              </div>
              <h3 className="text-sm font-semibold mb-1">{reward.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{reward.description}</p>
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${claimed ? "bg-[var(--accent)] text-black" : ""}`}>
                  {reward.cost_points} pts
                </Badge>
                {claimed ? (
                  <Check className="w-4 h-4 text-[var(--accent)]" />
                ) : (
                  <Button
                    size="sm"
                    onClick={() => claimReward.mutate(reward)}
                    disabled={!canAfford || claimReward.isPending}
                    className={`text-xs h-7 rounded-lg ${
                      canAfford
                        ? "bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)]"
                        : "bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed"
                    }`}
                  >
                    Claim
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--text-muted)]">No rewards available yet</p>
        </div>
      )}
    </div>
  );
}