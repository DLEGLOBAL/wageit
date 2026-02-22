import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function WagerSuggestions({ onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('aiWagerSuggestions', {});
      setSuggestions(data.suggestions || []);
    } catch (error) {
      toast.error("Failed to generate suggestions");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Wager Suggestions
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={generateSuggestions}
          disabled={loading}
          className="border-[var(--border)] text-xs"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : suggestions.length > 0 ? (
            <><RefreshCw className="w-3 h-3 mr-1" /> Refresh</>
          ) : (
            <><Sparkles className="w-3 h-3 mr-1" /> Generate</>
          )}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                  {suggestion.category === 'trending' ? (
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Target className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">{suggestion.title}</p>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{suggestion.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
                      {suggestion.wager_type}
                    </span>
                    <span className="text-[10px] text-purple-400">
                      ${suggestion.suggested_stake}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-6 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl">
          <Sparkles className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Click Generate to see AI-powered wager ideas</p>
        </div>
      )}
    </div>
  );
}