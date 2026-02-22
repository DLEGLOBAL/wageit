import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function InviteSystem({ userEmail }) {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile-referral", userEmail],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      let prof = profiles[0];
      
      // Generate referral code if doesn't exist
      if (!prof?.referral_code) {
        const code = `WG${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await base44.entities.UserProfile.update(prof.id, { referral_code: code });
        prof = { ...prof, referral_code: code };
      }
      
      return prof;
    },
    enabled: !!userEmail,
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", userEmail],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: userEmail }),
    enabled: !!userEmail,
  });

  const referralLink = profile?.referral_code 
    ? `${window.location.origin}?ref=${profile.referral_code}` 
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailInvite = async () => {
    if (!inviteEmail) return toast.error("Enter an email address");
    
    try {
      await base44.functions.invoke('sendReferralEmail', {
        referrer_email: userEmail,
        recipient_email: inviteEmail,
        referral_code: profile?.referral_code
      });
      
      toast.success("Invitation sent!");
      setInviteEmail("");
    } catch (err) {
      toast.error(err.message || "Failed to send invite");
    }
  };

  const completedReferrals = referrals.filter(r => r.status === "completed").length;
  const pendingRewards = referrals.filter(r => r.status === "completed" && !r.reward_claimed).length;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold">Invite Friends & Earn</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Invite friends and you both get $5 bonus when they complete their first wager!
        </p>

        <div className="space-y-3">
          {/* Referral Link */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Your Referral Link</p>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl text-xs"
              />
              <Button
                onClick={handleCopy}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Email Invite */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Send Email Invite</p>
            <div className="flex gap-2">
              <Input
                placeholder="friend@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl text-xs"
              />
              <Button
                onClick={handleEmailInvite}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
          <p className="text-xs text-[var(--text-muted)] mb-1">Total Referrals</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{completedReferrals}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3">
          <p className="text-xs text-[var(--text-muted)] mb-1">Pending Rewards</p>
          <p className="text-2xl font-bold text-purple-400">{pendingRewards}</p>
        </div>
      </div>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Recent Referrals</p>
          <div className="space-y-2">
            {referrals.slice(0, 5).map(ref => (
              <div key={ref.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{ref.referred_email || "Pending"}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(ref.created_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={`${
                  ref.status === "completed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                } border-0 text-[10px]`}>
                  {ref.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}