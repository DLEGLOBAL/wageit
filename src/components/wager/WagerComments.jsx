import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Send } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

export default function WagerComments({ wagerId }) {
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", wagerId],
    queryFn: () => base44.entities.Comment.filter({ wager_id: wagerId }, "-created_date", 50),
    enabled: !!wagerId,
  });

  const addComment = useMutation({
    mutationFn: async (content) => {
      const profile = await base44.entities.UserProfile.filter({ user_email: user.email });
      return base44.entities.Comment.create({
        wager_id: wagerId,
        user_email: user.email,
        username: profile[0]?.username || user.full_name,
        avatar_url: profile[0]?.avatar_url,
        content,
      });
    },
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: ["comments", wagerId] });
      const previous = qc.getQueryData(["comments", wagerId]);
      
      const profile = await base44.entities.UserProfile.filter({ user_email: user.email });
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        wager_id: wagerId,
        user_email: user.email,
        username: profile[0]?.username || user.full_name,
        avatar_url: profile[0]?.avatar_url,
        content,
        likes: [],
        created_date: new Date().toISOString(),
      };
      
      qc.setQueryData(["comments", wagerId], (old = []) => [optimisticComment, ...old]);
      return { previous };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(["comments", wagerId], context.previous);
      toast.error("Failed to post comment");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", wagerId] });
      setComment("");
      toast.success("Comment posted!");
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (commentId) => {
      const comm = comments.find(c => c.id === commentId);
      const likes = comm.likes || [];
      const newLikes = likes.includes(user.email)
        ? likes.filter(e => e !== user.email)
        : [...likes, user.email];
      return base44.entities.Comment.update(commentId, { likes: newLikes });
    },
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: ["comments", wagerId] });
      const previous = qc.getQueryData(["comments", wagerId]);
      
      qc.setQueryData(["comments", wagerId], (old = []) => 
        old.map(comment => {
          if (comment.id === commentId) {
            const likes = comment.likes || [];
            const newLikes = likes.includes(user.email)
              ? likes.filter(e => e !== user.email)
              : [...likes, user.email];
            return { ...comment, likes: newLikes };
          }
          return comment;
        })
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      qc.setQueryData(["comments", wagerId], context.previous);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", wagerId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>
      </div>

      {user && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl resize-none h-20"
          />
          <Button
            onClick={() => addComment.mutate(comment)}
            disabled={!comment.trim() || addComment.isPending}
            className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl h-20 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {comments.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] overflow-hidden shrink-0">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                      {(c.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{c.username}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{moment(c.created_date).fromNow()}</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{c.content}</p>
                  <button
                    onClick={() => toggleLike.mutate(c.id)}
                    disabled={!user}
                    className={`flex items-center gap-1 mt-2 text-xs ${
                      c.likes?.includes(user?.email) ? "text-red-400" : "text-[var(--text-muted)]"
                    } hover:text-red-400 transition-colors`}
                  >
                    <Heart className={`w-3 h-3 ${c.likes?.includes(user?.email) ? "fill-current" : ""}`} />
                    {c.likes?.length || 0}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-center text-sm text-[var(--text-muted)] py-8">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}