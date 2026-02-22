import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import AchievementBadges from "../components/profile/AchievementBadges";
import ReputationTier from "../components/gamification/ReputationTier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Trophy, TrendingDown, Star, Zap, Settings, Shield,
  LogOut, Camera, Loader2, BadgeCheck, Users
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) return profiles[0];
      return base44.entities.UserProfile.create({
        user_email: user.email,
        username: user.full_name || user.email.split("@")[0],
        reputation_score: 100,
      });
    },
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const updateProfile = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setEditOpen(false);
      toast.success("Profile updated!");
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateProfile.mutate({ avatar_url: file_url });
  };

  const openEdit = () => {
    setEditForm({ username: profile?.username || "", bio: profile?.bio || "" });
    setEditOpen(true);
  };

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader
        title="Profile"
        rightAction={
          <Button variant="ghost" size="icon" onClick={openEdit} className="text-[var(--text-muted)]">
            <Settings className="w-5 h-5" />
          </Button>
        }
      />

      <div className="px-4 py-6 space-y-5">
        {/* Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border)] overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--text-muted)]">
                  {(profile?.username || "?")[0].toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-black" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile?.username || "Loading..."}</h2>
            {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-[var(--accent)]" />}
          </div>
          {profile?.bio && <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{profile.bio}</p>}
          <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
            <span><strong className="text-white">{profile?.followers?.length || 0}</strong> followers</span>
            <span><strong className="text-white">{profile?.following?.length || 0}</strong> following</span>
          </div>
        </motion.div>

        {/* Reputation Tier */}
        {profile && (
          <ReputationTier 
            tier={profile.reputation_tier || 'bronze'} 
            reputation={profile.reputation_score || 100}
            showDetails={true}
          />
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <AchievementBadges achievements={achievements} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Wins" value={profile?.wins || 0} icon={Trophy} />
          <StatCard label="Losses" value={profile?.losses || 0} icon={TrendingDown} color="text-red-400" />
          <StatCard label="Rep Score" value={profile?.reputation_score || 100} icon={Star} color="text-yellow-400" />
          <StatCard label="Completed" value={profile?.completed_wagers || 0} icon={Zap} color="text-blue-400" />
        </div>

        {/* Total Wagered */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-center">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Total Wagered</p>
          <p className="text-3xl font-black text-[var(--accent)]">
            ${((profile?.total_wagered || 0) / 100).toFixed(2)}
          </p>
        </div>

        {/* Verification */}
        {!profile?.is_id_verified && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Verify Your Identity</p>
              <p className="text-xs text-[var(--text-muted)]">Get the verified badge and unlock higher limits</p>
            </div>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs">
              Verify
            </Button>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          onClick={() => base44.auth.logout()}
          className="w-full h-12 border-[var(--border)] text-red-400 hover:bg-red-500/10 rounded-xl"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[var(--surface)] border-[var(--border)] text-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={editForm.username}
              onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
              className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12"
            />
            <Textarea
              placeholder="Bio"
              value={editForm.bio}
              onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
              className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl"
            />
            <Button
              onClick={() => updateProfile.mutate(editForm)}
              disabled={updateProfile.isPending}
              className="w-full h-12 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl font-bold"
            >
              {updateProfile.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}