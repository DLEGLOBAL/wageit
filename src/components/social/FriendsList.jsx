import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Check, X, Swords, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function FriendsList({ userEmail }) {
  const [searchEmail, setSearchEmail] = useState("");
  const qc = useQueryClient();

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friend-requests", userEmail],
    queryFn: () => base44.entities.FriendRequest.filter({ receiver_email: userEmail, status: "pending" }),
    enabled: !!userEmail,
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships", userEmail],
    queryFn: async () => {
      const friends1 = await base44.entities.Friendship.filter({ user1_email: userEmail });
      const friends2 = await base44.entities.Friendship.filter({ user2_email: userEmail });
      return [...friends1, ...friends2];
    },
    enabled: !!userEmail,
  });

  const { data: friendProfiles = [] } = useQuery({
    queryKey: ["friend-profiles", friendships],
    queryFn: async () => {
      const emails = friendships.map(f => 
        f.user1_email === userEmail ? f.user2_email : f.user1_email
      );
      if (emails.length === 0) return [];
      const profiles = await Promise.all(
        emails.map(email => base44.entities.UserProfile.filter({ user_email: email }).then(r => r[0]))
      );
      return profiles.filter(Boolean);
    },
    enabled: friendships.length > 0,
  });

  const sendRequest = useMutation({
    mutationFn: async (receiverEmail) => {
      const [senderProfile, receiverProfile] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: userEmail }).then(r => r[0]),
        base44.entities.UserProfile.filter({ user_email: receiverEmail }).then(r => r[0])
      ]);

      if (!receiverProfile) throw new Error("User not found");

      const existing = await base44.entities.FriendRequest.filter({
        sender_email: userEmail,
        receiver_email: receiverEmail
      });
      if (existing.length > 0) throw new Error("Request already sent");

      return base44.entities.FriendRequest.create({
        sender_email: userEmail,
        sender_username: senderProfile.username,
        receiver_email: receiverEmail,
        receiver_username: receiverProfile.username,
        status: "pending"
      });
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      setSearchEmail("");
      qc.invalidateQueries({ queryKey: ["friend-requests"] });
    },
    onError: (err) => toast.error(err.message)
  });

  const respondToRequest = useMutation({
    mutationFn: async ({ requestId, accept }) => {
      await base44.entities.FriendRequest.update(requestId, { 
        status: accept ? "accepted" : "rejected" 
      });

      if (accept) {
        const request = friendRequests.find(r => r.id === requestId);
        await base44.entities.Friendship.create({
          user1_email: request.sender_email,
          user2_email: request.receiver_email,
          became_friends_at: new Date().toISOString()
        });

        // Update friend counts
        const [p1, p2] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: request.sender_email }).then(r => r[0]),
          base44.entities.UserProfile.filter({ user_email: request.receiver_email }).then(r => r[0])
        ]);
        await Promise.all([
          base44.entities.UserProfile.update(p1.id, { friends_count: (p1.friends_count || 0) + 1 }),
          base44.entities.UserProfile.update(p2.id, { friends_count: (p2.friends_count || 0) + 1 })
        ]);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friend-requests", "friendships"] });
      toast.success("Request processed!");
    }
  });

  return (
    <div className="space-y-4">
      {/* Send Friend Request */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Add Friends
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address..."
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl"
          />
          <Button
            onClick={() => sendRequest.mutate(searchEmail)}
            disabled={!searchEmail || sendRequest.isPending}
            className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl"
          >
            {sendRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Pending Requests */}
      {friendRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Pending Requests ({friendRequests.length})
          </h3>
          <div className="space-y-2">
            {friendRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{req.sender_username}</p>
                  <p className="text-xs text-[var(--text-muted)]">{req.sender_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respondToRequest.mutate({ requestId: req.id, accept: true })}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToRequest.mutate({ requestId: req.id, accept: false })}
                    className="border-[var(--border)] text-white hover:bg-[var(--surface-2)] rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Friends ({friendProfiles.length})
        </h3>
        <div className="space-y-2">
          {friendProfiles.map((friend, i) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] overflow-hidden shrink-0">
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                      {(friend.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{friend.username}</p>
                    {friend.is_online && (
                      <span className="w-2 h-2 bg-green-400 rounded-full" title="Online" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{friend.wins}W / {friend.losses}L</p>
                </div>
                <Link to={createPageUrl(`CreateWager?opponent=${friend.user_email}`)}>
                  <Button
                    size="sm"
                    className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-lg"
                  >
                    <Swords className="w-4 h-4 mr-1" />
                    Challenge
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
          {friendProfiles.length === 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] py-8">No friends yet. Add some above!</p>
          )}
        </div>
      </div>
    </div>
  );
}