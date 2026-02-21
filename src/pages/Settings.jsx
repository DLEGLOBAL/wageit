import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import PageHeader from "../components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon, Bell, Shield, Trash2, Loader2,
  Mail, Lock, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account" />

      <div className="px-4 py-6 space-y-6">
        {/* Account Section */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Account Information
          </h3>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <div className="flex-1">
                <p className="text-xs text-[var(--text-muted)]">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[var(--text-muted)]" />
              <div className="flex-1">
                <p className="text-xs text-[var(--text-muted)]">Verification Status</p>
                <p className="text-sm font-medium">
                  {profile?.is_verified ? "✓ Verified" : "Not verified"}
                </p>
              </div>
              {!profile?.is_verified && (
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs">
                  Verify Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Notifications
          </h3>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive updates via email</p>
                </div>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Get real-time alerts</p>
                </div>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Privacy & Security
          </h3>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium">Profile Privacy</p>
                  <p className="text-xs text-[var(--text-muted)]">Make profile private</p>
                </div>
              </div>
              <Switch />
            </div>
            <Button variant="outline" className="w-full border-[var(--border)] text-white hover:bg-[var(--surface-2)] rounded-xl">
              Change Password
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">
            Danger Zone
          </h3>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--surface)] border-[var(--border)] text-white">
                <DialogHeader>
                  <DialogTitle className="text-red-400">Delete Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-muted)]">
                    This action is permanent and cannot be undone. All your data will be deleted.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm">Type "DELETE" to confirm</Label>
                    <Input
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12"
                    />
                  </div>
                  <Button
                    disabled={deleteConfirm !== "DELETE"}
                    className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
                  >
                    Permanently Delete Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}