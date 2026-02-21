import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Home, PlusCircle, Wallet, Bell, User, Shield, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const NAV_ITEMS = [
  { icon: Home, label: "Home", page: "Home" },
  { icon: PlusCircle, label: "Create", page: "CreateWager" },
  { icon: Wallet, label: "Wallet", page: "Wallet" },
  { icon: Bell, label: "Alerts", page: "Notifications" },
  { icon: User, label: "Profile", page: "Profile" },
];

const EXTENDED_NAV = [
  { icon: Trophy, label: "Ranks", page: "Leaderboard" },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifs", user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const notifs = await base44.entities.Notification.filter({ user_email: user.email, is_read: false });
      return notifs.length;
    },
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const hideNav = ["Terms", "WagerDetails"].includes(currentPageName);
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <style>{`
        :root {
          --accent: #00ff87;
          --accent-dim: #00cc6a;
          --surface: #13131a;
          --surface-2: #1a1a24;
          --surface-3: #22222e;
          --border: #2a2a38;
          --text-muted: #6b6b80;
        }
        body { background: #0a0a0f; }
        * { -webkit-tap-highlight-color: transparent; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex-1 pb-20 overflow-auto scrollbar-hide">
        {children}
        
        {/* Powered by Roccstar.AI */}
        <div className="text-center py-8 px-4">
          <div className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Powered by</span>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Roccstar.AI
            </span>
          </div>
        </div>
      </div>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-[var(--border)] z-50">
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
              const isActive = currentPageName === page;
              const isBell = page === "Notifications";
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-white"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                    {isBell && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                  {isActive && (
                    <div className="absolute -bottom-2 w-5 h-0.5 rounded-full bg-[var(--accent)]" />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to={createPageUrl("AdminPanel")}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  currentPageName === "AdminPanel" ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Shield className="w-5 h-5" strokeWidth={currentPageName === "AdminPanel" ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">Admin</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}