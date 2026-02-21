import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import { Bell, CheckCheck, Trophy, DollarSign, AlertTriangle, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  system: { icon: Bell, color: "text-[var(--text-muted)]", bg: "bg-[var(--surface-2)]" },
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
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
              className="text-[var(--accent)] text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </Button>
          )
        }
      />

      <div className="px-4 py-4 space-y-2">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] rounded-xl h-16 animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          notifications.map((notif, i) => {
            const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
            const NotifIcon = config.icon;
            const content = (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                  notif.is_read ? "bg-[var(--surface)]" : "bg-[var(--surface-2)] border border-[var(--border)]"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <NotifIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.is_read ? "text-[var(--text-muted)]" : "text-white"}`}>{notif.title}</p>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{moment(notif.created_date).fromNow()}</p>
                </div>
                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shrink-0" />}
              </motion.div>
            );

            if (notif.wager_id) {
              return <Link key={notif.id} to={createPageUrl(`WagerDetails?id=${notif.wager_id}`)}>{content}</Link>;
            }
            return content;
          })
        )}
      </div>
    </div>
  );
}