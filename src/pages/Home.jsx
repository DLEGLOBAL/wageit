import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, Flame, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import WagerCard from "../components/wager/WagerCard";
import EmptyState from "../components/common/EmptyState";

export default function Home() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wagers = [], isLoading } = useQuery({
    queryKey: ["wagers", tab],
    queryFn: async () => {
      if (tab === "my" && user?.email) {
        const created = await base44.entities.Wager.filter({ creator_email: user.email }, "-created_date", 50);
        const opponent = await base44.entities.Wager.filter({ opponent_email: user.email }, "-created_date", 50);
        const combined = [...created, ...opponent];
        const unique = Array.from(new Map(combined.map(w => [w.id, w])).values());
        return unique.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
      return base44.entities.Wager.filter({ privacy: "public" }, "-created_date", 50);
    },
    enabled: tab !== "my" || !!user?.email,
  });

  const filtered = wagers.filter(w => {
    if (search && !w.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "featured") return w.is_featured;
    if (tab === "open") return w.status === "open";
    return true;
  });

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="px-4 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight">WageIt</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {user ? `Welcome back, ${user.full_name?.split(" ")[0] || "Challenger"}` : "Challenge anyone. Win big."}
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search wagers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { value: "all", label: "All", icon: TrendingUp },
            { value: "open", label: "Open", icon: Zap },
            { value: "featured", label: "Featured", icon: Flame },
            { value: "my", label: "My Wagers", icon: null },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.value
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {t.icon && <t.icon className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wager Feed */}
      <div className="px-4 space-y-3 pb-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] rounded-2xl h-32 animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((wager, i) => (
            <WagerCard key={wager.id} wager={wager} index={i} />
          ))
        ) : (
          <EmptyState
            icon={Zap}
            title="No wagers yet"
            description="Be the first to create a challenge"
            action={
              <Link to={createPageUrl("CreateWager")}>
                <Button className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl">
                  <PlusCircle className="w-4 h-4 mr-2" /> Create Wager
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}