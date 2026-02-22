import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import PageHeader from "../components/common/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, CheckCheck, Trophy, DollarSign, AlertTriangle, MessageSquare, Zap,
  UserPlus, Check, Trash2, Loader2
} from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";

const NOTIF_ICONS = {
  wager_accepted: { icon: Zap, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  wager_expiring: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  proof_submitted: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
  dispute_opened: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  funds_released: { icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
  deposit_confirmed: { icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
  wager_won: { icon: Trophy, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  wager_lost: { icon: Trophy, color: "text-red-400", bg: "bg-red-500/10" },
  wager_cancelled: { icon: Trophy, color: "text-orange-400", bg: "bg-orange-500/10" },
  system: { icon: Bell, color: "text-[var(--text-muted)]", bg: "bg-[var(--surface-2)]" },
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friend-requests-notif", user?.email],
    queryFn: () => base44.entities.FriendRequest.filter({
      receiver_email: user.email,
      status: "pending"
    }),
    enabled: !!user?.email,
  });

  const markAsRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-notifs"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-notifs"] });
    },
  });

  const deleteNotif = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead.mutate(notif.id);
    }
    if (notif.wager_id) {
      navigate(createPageUrl(`WagerDetails?id=${notif.wager_id}`));
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    if (filter === "wagers") return n.type && (n.type.includes("wager") || n.type.includes("proof") || n.type.includes("dispute"));
    if (filter === "financial") return ["deposit_confirmed", "funds_released"].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        rightAction={
          unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-[var(--accent)] text-xs"
            >
              {markAllRead.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all</>
              )}
            </Button>
          )
        }
      />

      <div className="px-4 py-4">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-4">
          <TabsList className="grid w-full grid-cols-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
            <TabsTrigger value="all" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              All
              {notifications.length > 0 && (
                <Badge className="ml-1 bg-[var(--surface-2)] text-white text-[10px] h-4 px-1.5 border-0">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-[10px] h-4 px-1.5 border-0">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="wagers" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              Wagers
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              Money
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-1">
              Friend Requests
            </h3>
            <div className="space-y-2">
              {friendRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{req.sender_username}</p>
                        <p className="text-xs text-[var(--text-muted)]">wants to be friends</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(createPageUrl("Profile"))}
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg h-7 text-xs px-3"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-[var(--surface)] rounded-xl h-20 animate-pulse" />
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif, i) => {
              const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
              const NotifIcon = config.icon;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    notif.is_read
                      ? "bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                      : "bg-[var(--surface-2)] border border-[var(--accent)]/30 hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <NotifIcon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-0.5 ${notif.is_read ? "text-[var(--text-muted)]" : "text-white"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{moment(notif.created_date).fromNow()}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {!notif.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead.mutate(notif.id);
                        }}
                        className="p-1 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif.mutate(notif.id);
                      }}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}