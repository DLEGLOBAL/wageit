import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import AchievementBadges from "../components/profile/AchievementBadges";
import ReputationTier from "../components/gamification/ReputationTier";
import StatsAnalytics from "../components/profile/StatsAnalytics";
import FriendsList from "../components/social/FriendsList";
import ActivityFeed from "../components/social/ActivityFeed";
import InviteSystem from "../components/social/InviteSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Trophy, TrendingDown, Star, Zap, Settings, Shield, DollarSign,
  LogOut, Camera, Loader2, BadgeCheck, Users, BarChart3, Gift, Upload, Edit, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import RewardsShop from "../components/gamification/RewardsShop";

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

  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships-simple", user?.email],
    queryFn: async () => {
      const f1 = await base44.entities.Friendship.filter({ user1_email: user.email });
      const f2 = await base44.entities.Friendship.filter({ user2_email: user.email });
      return [...f1, ...f2];
    },
    enabled: !!user?.email,
  });

  const { data: points = { points: 0 } } = useQuery({
    queryKey: ["points", user?.email],
    queryFn: async () => {
      const p = await base44.entities.Points.filter({ user_email: user.email });
      return p[0] || { points: 0, total_earned: 0 };
    },
    enabled: !!user?.email,
  });

  const friendEmails = friendships.map(f => 
    f.user1_email === user?.email ? f.user2_email : f.user1_email
  );

  const uploadBanner = async (file) => {
    const { data } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.UserProfile.update(profile.id, { banner_url: data.file_url });
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Banner updated!");
  };

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
    const { data } = await base44.integrations.Core.UploadFile({ file });
    updateProfile.mutate({ avatar_url: data.file_url });
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

      <div className="px-4 py-6 space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative -mx-4 -mt-6 mb-6"
        >
          <div className="h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 relative overflow-hidden">
            {profile?.banner_url && (
              <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
            )}
            <label className="absolute bottom-2 right-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && uploadBanner(e.target.files[0])}
              />
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1 text-xs text-white hover:bg-black/70 transition-colors">
                <Upload className="w-3 h-3" /> Banner
              </div>
            </label>
          </div>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative -mt-16"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-[var(--surface)] overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                      {(user?.full_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent-dim)] transition-colors">
                <Camera className="w-4 h-4 text-black" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold mb-1">{profile?.username || user?.full_name}</h2>
              {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-[var(--accent)]" />}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-3">{user?.email}</p>
            {profile?.bio && (
              <p className="text-sm text-[var(--text-muted)] max-w-sm">{profile.bio}</p>
            )}
          </div>
        </motion.div>

        {/* Points Banner */}
        <div className="bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Points Balance</p>
            <p className="text-2xl font-bold text-[var(--accent)]">{points.points || 0}</p>
            <p className="text-xs text-[var(--text-muted)]">Total Earned: {points.total_earned || 0}</p>
          </div>
          <Sparkles className="w-10 h-10 text-[var(--accent)]" />
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <TabsTrigger value="overview" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              <Sparkles className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              <BarChart3 className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              <Users className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="invite" className="text-xs rounded-lg data-[state=active]:bg-[var(--accent)] data-[state=active]:text-black">
              <Gift className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {profile && (
              <ReputationTier 
                tier={profile.reputation_tier || 'bronze'} 
                reputation={profile.reputation_score || 100}
                showDetails={true}
              />
            )}

            {achievements.length > 0 && (
              <AchievementBadges achievements={achievements} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Wins" value={profile?.wins || 0} icon={Trophy} />
              <StatCard label="Losses" value={profile?.losses || 0} />
              <StatCard label="Friends" value={profile?.friends_count || 0} icon={Users} />
              <StatCard label="Total Wagered" value={`$${((profile?.total_wagered || 0) / 100).toFixed(0)}`} icon={DollarSign} />
            </div>

            <Button
              variant="outline"
              onClick={() => base44.auth.logout()}
              className="w-full h-12 border-[var(--border)] text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </TabsContent>

          {/* Rewards Shop Tab */}
          <TabsContent value="rewards" className="mt-6">
            <RewardsShop user={user} />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-6">
            <StatsAnalytics userEmail={user?.email} />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-6 space-y-6">
            <FriendsList userEmail={user?.email} />
            
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
                Friends Activity
              </h3>
              <ActivityFeed friendEmails={friendEmails} />
            </div>
          </TabsContent>

          {/* Invite Tab */}
          <TabsContent value="invite" className="mt-6">
            <InviteSystem userEmail={user?.email} />
          </TabsContent>
        </Tabs>
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