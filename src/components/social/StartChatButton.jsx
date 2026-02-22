import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { toast } from "sonner";

export default function StartChatButton({ userEmail, friendEmail, className }) {
  const navigate = useNavigate();

  const startChat = useMutation({
    mutationFn: async () => {
      // Check if room already exists
      const existingRooms = await base44.entities.ChatRoom.filter({
        room_type: "direct",
        participant_emails: { $all: [userEmail, friendEmail] }
      });

      if (existingRooms.length > 0) {
        return existingRooms[0];
      }

      // Create new room
      return base44.entities.ChatRoom.create({
        room_type: "direct",
        participant_emails: [userEmail, friendEmail]
      });
    },
    onSuccess: (room) => {
      navigate(createPageUrl(`Chat?room=${room.id}`));
    },
    onError: () => toast.error("Failed to start chat")
  });

  return (
    <Button
      onClick={() => startChat.mutate()}
      disabled={startChat.isPending}
      className={className}
    >
      <MessageSquare className="w-4 h-4" />
    </Button>
  );
}