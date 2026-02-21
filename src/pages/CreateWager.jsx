import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageHeader from "../components/common/PageHeader";
import { Zap, Trophy, Clock, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateWager() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    wager_type: "skill_based",
    stake_amount: "",
    opponent_email: "",
    proof_type: "any",
    privacy: "public",
    expires_days: "7",
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl("Home")));
  }, []);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.stake_amount || Number(form.stake_amount) < 1) return toast.error("Minimum stake is $1");

    setLoading(true);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(form.expires_days || 7));

    const wager = await base44.entities.Wager.create({
      title: form.title.trim(),
      description: form.description.trim(),
      wager_type: form.wager_type,
      stake_amount: Math.round(Number(form.stake_amount) * 100),
      creator_email: user.email,
      creator_name: user.full_name,
      opponent_email: form.opponent_email.trim() || undefined,
      proof_type: form.proof_type,
      privacy: form.privacy,
      expires_at: expiresAt.toISOString(),
      status: form.opponent_email.trim() ? "pending_funding" : "open",
    });

    toast.success("Wager created!");
    navigate(createPageUrl(`WagerDetails?id=${wager.id}`));
  };

  const TYPES = [
    { value: "skill_based", label: "Skill-Based", icon: Zap, desc: "Test your abilities" },
    { value: "event_outcome", label: "Event Outcome", icon: Trophy, desc: "Predict the result" },
    { value: "time_challenge", label: "Time Challenge", icon: Clock, desc: "Beat the clock" },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Create Wager" subtitle="Set up your challenge" backButton />

      <div className="px-4 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Wager Title</Label>
          <Input
            placeholder="e.g. I can run a 6-min mile"
            value={form.title}
            onChange={e => update("title", e.target.value)}
            className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl h-12"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Description</Label>
          <Textarea
            placeholder="Describe the terms of your wager..."
            value={form.description}
            onChange={e => update("description", e.target.value)}
            className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl min-h-[100px]"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Wager Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => update("wager_type", t.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  form.wager_type === t.value
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <t.icon className={`w-5 h-5 mx-auto mb-1 ${form.wager_type === t.value ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
                <span className="text-xs font-medium block">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stake */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Stake Amount ($)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent)]" />
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={form.stake_amount}
              onChange={e => update("stake_amount", e.target.value)}
              className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl h-12 pl-10 text-lg font-semibold"
            />
          </div>
        </div>

        {/* Opponent */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Opponent Email (optional)</Label>
          <Input
            type="email"
            placeholder="Leave empty for open challenge"
            value={form.opponent_email}
            onChange={e => update("opponent_email", e.target.value)}
            className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl h-12"
          />
        </div>

        {/* Proof Type */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Proof Required</Label>
          <Select value={form.proof_type} onValueChange={v => update("proof_type", v)}>
            <SelectTrigger className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any evidence</SelectItem>
              <SelectItem value="photo">Photo proof</SelectItem>
              <SelectItem value="video">Video proof</SelectItem>
              <SelectItem value="link">External link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expiration */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">Expires In</Label>
          <Select value={form.expires_days} onValueChange={v => update("expires_days", v)}>
            <SelectTrigger className="bg-[var(--surface)] border-[var(--border)] text-white rounded-xl h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div>
            <p className="text-sm font-medium">Private Wager</p>
            <p className="text-xs text-[var(--text-muted)]">Only visible to participants</p>
          </div>
          <Switch
            checked={form.privacy === "private"}
            onCheckedChange={checked => update("privacy", checked ? "private" : "public")}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl text-base font-bold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Wager"}
        </Button>
      </div>
    </div>
  );
}