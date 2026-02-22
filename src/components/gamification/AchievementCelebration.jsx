import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AchievementCelebration({ achievement, onClose }) {
  useEffect(() => {
    if (achievement) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff87', '#00cc6a', '#FFD700', '#FFA500']
      });
    }
  }, [achievement]);

  if (!achievement) return null;

  const achievementNames = {
    first_wager: { name: 'First Wager', desc: 'You placed your first wager!', icon: '🎯' },
    first_win: { name: 'First Victory', desc: 'Won your first wager!', icon: '🏆' },
    ten_wins: { name: '10 Victories', desc: 'You won 10 wagers!', icon: '🌟' },
    fifty_wins: { name: '50 Victories', desc: 'You won 50 wagers!', icon: '⭐' },
    hundred_wins: { name: '100 Victories', desc: 'You won 100 wagers!', icon: '💫' },
    win_streak_3: { name: '3 Win Streak', desc: 'Won 3 wagers in a row!', icon: '🔥' },
    win_streak_5: { name: '5 Win Streak', desc: 'Won 5 wagers in a row!', icon: '🔥' },
    win_streak_10: { name: '10 Win Streak', desc: 'Unstoppable! 10 wins in a row!', icon: '⚡' },
    high_roller: { name: 'High Roller', desc: 'Wagered over $1,000 total!', icon: '💎' },
    big_spender: { name: 'Big Spender', desc: 'Single wager over $500!', icon: '👑' },
    perfect_record: { name: 'Perfect Record', desc: '90%+ win rate with 10+ wins!', icon: '✨' },
    verified_user: { name: 'Verified', desc: 'Successfully verified your identity!', icon: '✓' },
    fearless: { name: 'Fearless', desc: 'Accepted 5+ high-stake challenges!', icon: '🦁' },
    precision_master: { name: 'Precision Master', desc: 'Won 5+ skill-based wagers!', icon: '🎯' }
  };

  const info = achievementNames[achievement.achievement_type] || { name: achievement.achievement_type, desc: '', icon: '🏆' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border-2 border-[var(--accent)] rounded-3xl p-8 max-w-sm w-full text-center relative"
          onClick={e => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {info.icon}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-2xl font-bold text-[var(--accent)]">Achievement Unlocked!</h2>
            </div>
            <h3 className="text-xl font-bold mb-2">{info.name}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">{info.desc}</p>
            <Button
              onClick={onClose}
              className="w-full bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl h-12 font-bold"
            >
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}