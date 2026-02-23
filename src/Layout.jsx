import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Home, PlusCircle, Wallet, Bell, User, Shield, Trophy, Settings, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AchievementCelebration from "./components/gamification/AchievementCelebration";
import PageTransition from "./components/common/PageTransition";

const NAV_ITEMS = [
  { icon: Home, label: "Home", page: "Home" },
  { icon: PlusCircle, label: "Create", page: "CreateWager" },
  { icon: Wallet, label: "Wallet", page: "Wallet" },
  { icon: Bell, label: "Alerts", page: "Notifications" },
  { icon: User, label: "Profile", page: "Profile" },
];

const EXTENDED_NAV = [
  { icon: Trophy, label: "Ranks", page: "Leaderboard" },
  { icon: Settings, label: "Settings", page: "Settings" },
];

const MESSAGES_NAV = { icon: MessageSquare, label: "Messages", page: "Messages" };

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [scrollPositions, setScrollPositions] = useState({});
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data?.type === 'system' && event.data?.title?.includes('Achievement')) {
        const achievementType = event.data?.message?.split('You earned: ')[1]?.toLowerCase().replace(/ /g, '_');
        if (achievementType) {
          setNewAchievement({ achievement_type: achievementType });
        }
      }
    });
    return unsubscribe;
  }, [user?.email]);

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

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ["unread-messages", user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const rooms = await base44.entities.ChatRoom.filter({
        participant_emails: { $in: [user.email] }
      });
      let total = 0;
      for (const room of rooms) {
        const unread = await base44.entities.Message.filter({
          room_id: room.id,
          sender_email: { $ne: user.email },
          read_by: { $nin: [user.email] }
        });
        total += unread.length;
      }
      return total;
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const hideNav = ["Terms", "WagerDetails", "Landing", "Chat"].includes(currentPageName);
  const isAdmin = user?.role === "admin";
  const contentRef = useRef(null);

  // Save scroll position before navigation
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setScrollPositions(prev => ({
          ...prev,
          [currentPageName]: contentRef.current.scrollTop
        }));
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, [currentPageName]);

  // Restore scroll position after navigation
  useEffect(() => {
    if (contentRef.current && scrollPositions[currentPageName] !== undefined) {
      contentRef.current.scrollTop = scrollPositions[currentPageName];
    }
  }, [currentPageName, scrollPositions]);

  // Handle clicking active tab to reset to root
  const handleNavClick = (e, page) => {
    if (currentPageName === page) {
      e.preventDefault();
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Reset to root state if needed (refresh data)
      window.location.href = createPageUrl(page);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <AchievementCelebration 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />
      <style>{`
        @media (prefers-color-scheme: dark) {
          :root {
            --accent: #00ff87;
            --accent-dim: #00cc6a;
            --surface: #13131a;
            --surface-2: #1a1a24;
            --surface-3: #22222e;
            --border: #2a2a38;
            --text-muted: #6b6b80;
            --bg-primary: #0a0a0f;
            --text-primary: #ffffff;
            --safe-area-top: env(safe-area-inset-top, 0px);
            --safe-area-bottom: env(safe-area-inset-bottom, 0px);
          }
        }
        
        @media (prefers-color-scheme: light) {
          :root {
            --accent: #00cc6a;
            --accent-dim: #00b35e;
            --surface: #f5f5f5;
            --surface-2: #e8e8e8;
            --surface-3: #d4d4d4;
            --border: #d1d1d1;
            --text-muted: #6b6b80;
            --bg-primary: #ffffff;
            --text-primary: #0a0a0f;
            --safe-area-top: env(safe-area-inset-top, 0px);
            --safe-area-bottom: env(safe-area-inset-bottom, 0px);
          }
        }
        
        body { 
          background: var(--bg-primary);
          color: var(--text-primary);
          overscroll-behavior: none;
          -webkit-user-select: none;
          user-select: none;
        }
        input, textarea {
          -webkit-user-select: text;
          user-select: text;
        }
        * { -webkit-tap-highlight-color: transparent; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div ref={contentRef} className="flex-1 pb-20 overflow-auto scrollbar-hide">
        <PageTransition>
          {children}
        </PageTransition>
        
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
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-t border-[var(--border)] z-50" style={{ paddingBottom: 'calc(0.5rem + var(--safe-area-bottom))' }}>
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
              const isActive = currentPageName === page;
              const isBell = page === "Notifications";
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  onClick={(e) => handleNavClick(e, page)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
            {isAdmin ? (
              <Link
                to={createPageUrl("AdminPanel")}
                onClick={(e) => handleNavClick(e, "AdminPanel")}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  currentPageName === "AdminPanel" ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Shield className="w-5 h-5" strokeWidth={currentPageName === "AdminPanel" ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">Admin</span>
              </Link>
            ) : (
              <Link
                to={createPageUrl("Messages")}
                onClick={(e) => handleNavClick(e, "Messages")}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                  currentPageName === "Messages" ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="relative">
                  <MessageSquare className="w-5 h-5" strokeWidth={currentPageName === "Messages" ? 2.5 : 1.5} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--accent)] rounded-full text-[10px] font-bold flex items-center justify-center text-black">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Chat</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}