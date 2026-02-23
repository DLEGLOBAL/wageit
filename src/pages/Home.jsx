import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, Flame, TrendingUp, Zap, Sparkles, Lightbulb, SlidersHorizontal, Compass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import WagerCard from "../components/wager/WagerCard";
import EmptyState from "../components/common/EmptyState";
import AdvancedFilters from "../components/wager/AdvancedFilters";
import { toast } from "sonner";
import PullToRefresh from "react-simple-pull-to-refresh";

export default function Home() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [sortBy, setSortBy] = useState("-created_date");
  const [filters, setFilters] = useState({
    wagerTypes: [],
    minStake: 0,
    maxStake: 10000,
    expiringSoon: false,
    keywords: ""
  });
  const [discoverCategories, setDiscoverCategories] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wagers = [], isLoading } = useQuery({
    queryKey: ["wagers", tab, sortBy],
    queryFn: async () => {
      if (tab === "my" && user?.email) {
        const created = await base44.entities.Wager.filter({ creator_email: user.email }, sortBy, 100);
        const opponent = await base44.entities.Wager.filter({ opponent_email: user.email }, sortBy, 100);
        const combined = [...created, ...opponent];
        const unique = Array.from(new Map(combined.map(w => [w.id, w])).values());
        return unique.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
      return base44.entities.Wager.filter({ privacy: "public" }, sortBy, 100);
    },
    enabled: tab !== "my" || !!user?.email,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!wagers.length) return;
    const unsubscribe = base44.entities.Wager.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        queryClient.invalidateQueries({ queryKey: ["wagers"] });
      }
    });
    return unsubscribe;
  }, [wagers.length]);

  const filtered = wagers.filter(w => {
    if (search && !w.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "featured") return w.is_featured;
    if (tab === "open") return w.status === "open";
    
    // Advanced filters
    if (filters.wagerTypes.length > 0 && !filters.wagerTypes.includes(w.wager_type)) return false;
    const stakeInDollars = (w.stake_amount || 0) / 100;
    if (stakeInDollars < filters.minStake || stakeInDollars > filters.maxStake) return false;
    if (filters.expiringSoon) {
      const hoursUntilExpiry = (new Date(w.expires_at) - new Date()) / (1000 * 60 * 60);
      if (hoursUntilExpiry > 24) return false;
    }
    if (filters.keywords && !w.description?.toLowerCase().includes(filters.keywords.toLowerCase())) return false;
    
    return true;
  });

  const getAISuggestions = async () => {
    setShowSuggestions(true);
    toast.loading("AI generating wager ideas...");
    const { data } = await base44.functions.invoke('aiWagerSuggestions', {});
    setAiSuggestions(data.suggestions || []);
    toast.dismiss();
    toast.success("Fresh ideas ready!");
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["wagers"] });
  };

  const loadDiscoverCategories = async () => {
    try {
      toast.loading("Loading curated wagers...");
      const { data } = await base44.functions.invoke('aiDiscoverWagers', {});
      setDiscoverCategories(data.categories || []);
      toast.dismiss();
      toast.success("Discover updated!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load discover");
    }
  };

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

      {/* AI Suggestions CTA */}
      {user && (
        <div className="px-4 mb-4">
          <button
            onClick={getAISuggestions}
            className="w-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3 hover:border-purple-500/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">AI Wager Ideas</p>
              <p className="text-xs text-[var(--text-muted)]">Get personalized challenge suggestions</p>
            </div>
            <Lightbulb className="w-5 h-5 text-purple-400" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search wagers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
            />
          </div>
          <AdvancedFilters filters={filters} onApply={setFilters} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[var(--border)] hover:bg-[var(--surface)] rounded-xl px-4">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[var(--surface)] border-[var(--border)]">
              <DropdownMenuItem onClick={() => setSortBy("-created_date")} className="cursor-pointer">
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("created_date")} className="cursor-pointer">
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("-stake_amount")} className="cursor-pointer">
                Highest Stake
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("stake_amount")} className="cursor-pointer">
                Lowest Stake
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { value: "all", label: "All", icon: TrendingUp },
            { value: "open", label: "Open", icon: Zap },
            { value: "featured", label: "Featured", icon: Flame },
            { value: "discover", label: "Discover", icon: Compass },
            { value: "my", label: "My Wagers", icon: null },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                if (t.value === "discover" && discoverCategories.length === 0) {
                  loadDiscoverCategories();
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.value
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.icon && <t.icon className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <div className="px-4 mb-4">
          <div className="bg-[var(--surface)] border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-400">AI Suggestions</h3>
              <button onClick={() => setShowSuggestions(false)} className="text-xs text-[var(--text-muted)]">Close</button>
            </div>
            {aiSuggestions.map((s, i) => (
              <div key={i} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3">
                <p className="text-sm font-medium text-white mb-1">{s.title}</p>
                <p className="text-xs text-[var(--text-muted)] mb-2">{s.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-400">${s.stake_amount}</span>
                  <Link to={createPageUrl(`CreateWager`)}>
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg h-7">
                      Use This
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discover Tab Content */}
      {tab === "discover" && discoverCategories.length > 0 && (
        <div className="px-4 mb-6 space-y-6">
          {discoverCategories.map((category, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <h3 className="text-sm font-bold">{category.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{category.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                {category.wagers?.map(wager => (
                  <WagerCard key={wager.id} wager={wager} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wager Feed with Pull to Refresh */}
      {tab !== "discover" && (
        <PullToRefresh
          onRefresh={handleRefresh}
          pullingContent=""
          refreshingContent={
            <div className="flex justify-center py-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 text-[var(--accent)]" />
              </motion.div>
            </div>
          }
          pullDownThreshold={80}
          maxPullDownDistance={100}
          resistance={2}
        >
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
        </PullToRefresh>
      )}
    </div>
  );
}