import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import { MessageSquare, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Messages() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: rooms = [] } = useQuery({
    queryKey: ["chat-rooms", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allRooms = await base44.entities.ChatRoom.filter({
        participant_emails: { $in: [user.email] }
      }, "-last_message_at", 50);
      return allRooms;
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  // Get unread counts
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ["unread-counts", user?.email, rooms],
    queryFn: async () => {
      const counts = {};
      for (const room of rooms) {
        const unread = await base44.entities.Message.filter({
          room_id: room.id,
          sender_email: { $ne: user.email },
          read_by: { $nin: [user.email] }
        });
        counts[room.id] = unread.length;
      }
      return counts;
    },
    enabled: !!user?.email && rooms.length > 0,
  });

  const getRoomTitle = (room) => {
    if (room.room_type === "wager") return "Wager Chat";
    const otherEmail = room.participant_emails.find(e => e !== user?.email);
    return otherEmail?.split("@")[0] || "Chat";
  };

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Messages" subtitle={`${rooms.length} conversations`} />

      <div className="px-4 py-6 space-y-3">
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No messages yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Start chatting with friends or in wager rooms</p>
          </div>
        ) : (
          rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={createPageUrl(`Chat?room=${room.id}`)}>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      room.room_type === "wager" ? "bg-purple-500/20" : "bg-[var(--surface-2)]"
                    }`}>
                      {room.room_type === "wager" ? (
                        <Trophy className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Users className="w-5 h-5 text-[var(--text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold truncate">{getRoomTitle(room)}</p>
                        {room.last_message_at && (
                          <span className="text-xs text-[var(--text-muted)] shrink-0 ml-2">
                            {moment(room.last_message_at).fromNow()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {room.last_message || "No messages yet"}
                      </p>
                    </div>
                    {unreadCounts[room.id] > 0 && (
                      <Badge className="bg-[var(--accent)] text-black border-0 shrink-0">
                        {unreadCounts[room.id]}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}