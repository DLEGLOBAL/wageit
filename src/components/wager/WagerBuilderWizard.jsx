import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Check, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WagerBuilderWizard({ form, onUpdate, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState("");

  const addRule = () => {
    if (!newRule.trim()) return;
    setCustomRules([...customRules, newRule.trim()]);
    setNewRule("");
  };

  const removeRule = (index) => {
    setCustomRules(customRules.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1 && !form.title.trim()) return;
    if (step === 2 && !form.stake_amount) return;
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onUpdate("custom_rules", customRules);
    onComplete();
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-8 h-1 rounded-full transition-colors ${
                s <= step ? "bg-[var(--accent)]" : "bg-[var(--surface-2)]"
              }`}
            />
          ))}
        </div>
        <button onClick={onCancel} className="text-xs text-[var(--text-muted)] hover:text-white">
          Cancel
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold mb-1">What's your wager?</h3>
              <p className="text-xs text-[var(--text-muted)]">Give it a catchy title</p>
            </div>
            <Input
              placeholder="e.g., I can run a 6-min mile"
              value={form.title}
              onChange={e => onUpdate("title", e.target.value)}
              className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12"
              autoFocus
            />
          </motion.div>
        )}

        {/* Step 2: Type & Amount */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold mb-1">Wager details</h3>
              <p className="text-xs text-[var(--text-muted)]">Choose type and stake amount</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">Wager Type</Label>
              <Select value={form.wager_type} onValueChange={v => onUpdate("wager_type", v)}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill_based">Skill-Based</SelectItem>
                  <SelectItem value="event_outcome">Event Outcome</SelectItem>
                  <SelectItem value="time_challenge">Time Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">Stake Amount ($)</Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="10.00"
                value={form.stake_amount}
                onChange={e => onUpdate("stake_amount", e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12"
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Custom Rules */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold mb-1">Set custom rules</h3>
              <p className="text-xs text-[var(--text-muted)]">Add specific conditions (optional)</p>
            </div>

            <div className="space-y-2">
              {customRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--surface-2)] rounded-lg p-3">
                  <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <p className="text-sm flex-1">{rule}</p>
                  <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a custom rule..."
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                onKeyPress={e => e.key === "Enter" && addRule()}
                className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-10"
              />
              <Button
                onClick={addRule}
                size="sm"
                className="bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Proof & Settings */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold mb-1">Proof & settings</h3>
              <p className="text-xs text-[var(--text-muted)]">How will you verify completion?</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">Proof Required</Label>
              <Select value={form.proof_type} onValueChange={v => onUpdate("proof_type", v)}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12">
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

            <div className="space-y-2">
              <Label className="text-sm text-[var(--text-muted)]">Expires In</Label>
              <Select value={form.expires_days} onValueChange={v => onUpdate("expires_days", v)}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-xl h-12">
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

            <div className="flex items-center justify-between bg-[var(--surface-2)] rounded-xl p-4">
              <div>
                <p className="text-sm font-medium">Private Wager</p>
                <p className="text-xs text-[var(--text-muted)]">Only visible to participants</p>
              </div>
              <Switch
                checked={form.privacy === "private"}
                onCheckedChange={checked => onUpdate("privacy", checked ? "private" : "public")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1 border-[var(--border)] rounded-xl h-12"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <Button
          onClick={step === 4 ? handleComplete : nextStep}
          className="flex-1 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl h-12 font-bold"
        >
          {step === 4 ? (
            <>Complete <Check className="w-4 h-4 ml-1" /></>
          ) : (
            <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}