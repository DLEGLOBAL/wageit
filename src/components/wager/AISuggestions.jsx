import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function AISuggestions({ suggestions, onSelect, loading }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-purple-300">AI analyzing your interests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold">AI Suggested Wagers</h3>
        <TrendingUp className="w-3 h-3 text-[var(--text-muted)]" />
      </div>

      {suggestions.map((suggestion, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all cursor-pointer"
          onClick={() => onSelect(suggestion)}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">{suggestion.title}</h4>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{suggestion.description}</p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-0 shrink-0">
              ${suggestion.suggested_stake}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
              {suggestion.category}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
              {suggestion.wager_type.replace('_', ' ')}
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  );
}