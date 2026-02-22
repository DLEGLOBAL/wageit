import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const qc = useQueryClient();

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: room } = useQuery({
    queryKey: ["chat-room", roomId],
    queryFn: () => base44.entities.ChatRoom.filter({ id: roomId }).then(r => r[0]),
    enabled: !!roomId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => base44.entities.Message.filter({ room_id: roomId }, "created_date", 200),
    enabled: !!roomId,
    refetchInterval: 3000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.room_id === roomId) {
        qc.invalidateQueries({ queryKey: ["messages", roomId] });
      }
    });
    return unsubscribe;
  }, [roomId]);

  // Mark messages as read
  useEffect(() => {
    if (!user?.email || !messages.length) return;
    
    const unreadMessages = messages.filter(m => 
      m.sender_email !== user.email && !m.read_by?.includes(user.email)
    );

    unreadMessages.forEach(m => {
      base44.entities.Message.update(m.id, {
        read_by: [...(m.read_by || []), user.email]
      });
    });
  }, [messages, user?.email]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      const profile = await base44.entities.UserProfile.filter({ user_email: user.email }).then(r => r[0]);
      
      const msg = await base44.entities.Message.create({
        room_id: roomId,
        sender_email: user.email,
        sender_username: profile?.username || user.full_name,
        content,
        read_by: [user.email]
      });

      // Update room last message
      await base44.entities.ChatRoom.update(roomId, {
        last_message: content,
        last_message_at: new Date().toISOString(),
        last_message_by: user.email
      });

      // Send notifications to other participants
      const otherParticipants = room.participant_emails.filter(e => e !== user.email);
      for (const email of otherParticipants) {
        await base44.entities.Notification.create({
          user_email: email,
          title: "💬 New Message",
          message: `${profile?.username || user.full_name}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
          type: "system"
        });
      }

      return msg;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", roomId] });
      setMessage("");
    },
    onError: () => toast.error("Failed to send message")
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message.trim());
  };

  const getRoomTitle = () => {
    if (!room) return "Chat";
    if (room.room_type === "wager") return "Wager Chat";
    const otherEmail = room.participant_emails.find(e => e !== user?.email);
    return otherEmail?.split("@")[0] || "Chat";
  };

  return (
    <div className="max-w-lg mx-auto h-screen flex flex-col">
      <PageHeader title={getRoomTitle()} backButton />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {messages.map((msg, i) => {
          const isOwn = msg.sender_email === user?.email;
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                {!isOwn && (
                  <span className="text-xs text-[var(--text-muted)] mb-1 px-3">
                    {msg.sender_username}
                  </span>
                )}
                <div className={`rounded-2xl px-4 py-2 ${
                  isOwn 
                    ? "bg-[var(--accent)] text-black" 
                    : "bg-[var(--surface)] border border-[var(--border)] text-white"
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 px-3">
                  {moment(msg.created_date).format("h:mm A")}
                </span>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[#0a0a0f] p-4 pb-24">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl resize-none h-12 py-3"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl h-12 px-4"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}