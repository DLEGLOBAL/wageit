import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Plus, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WagerBuilder({ onComplete }) {
  const [step, setStep] = useState(1);
  const [builderData, setBuilderData] = useState({
    conditions: [],
    milestones: [],
    rewards: [],
    penalties: []
  });

  const addCondition = () => {
    setBuilderData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { type: "", value: "", description: "" }]
    }));
  };

  const updateCondition = (index, field, value) => {
    const updated = [...builderData.conditions];
    updated[index][field] = value;
    setBuilderData(prev => ({ ...prev, conditions: updated }));
  };

  const removeCondition = (index) => {
    setBuilderData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const steps = [
    { num: 1, title: "Conditions", desc: "Define win/loss criteria" },
    { num: 2, title: "Milestones", desc: "Set checkpoints" },
    { num: 3, title: "Review", desc: "Finalize rules" }
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${step >= s.num ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                step >= s.num ? "bg-[var(--accent)] text-black" : "bg-[var(--surface-2)]"
              }`}>
                {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-[10px] font-medium">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Conditions */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Win Conditions</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">Define what needs to happen to win</p>
            </div>

            {builderData.conditions.map((condition, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">Condition {i + 1}</Badge>
                  <button onClick={() => removeCondition(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <Input
                  placeholder="e.g., Time under 6 minutes"
                  value={condition.description}
                  onChange={e => updateCondition(i, "description", e.target.value)}
                  className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-lg h-9 text-sm"
                />
              </div>
            ))}

            <Button
              onClick={addCondition}
              variant="outline"
              className="w-full border-dashed border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Condition
            </Button>
          </motion.div>
        )}

        {/* Step 2: Milestones */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Milestones (Optional)</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">Add checkpoints to track progress</p>
            </div>

            {builderData.milestones.map((milestone, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 space-y-2">
                <Input
                  placeholder="e.g., Complete 5 out of 10 tasks"
                  value={milestone}
                  onChange={e => {
                    const updated = [...builderData.milestones];
                    updated[i] = e.target.value;
                    setBuilderData(prev => ({ ...prev, milestones: updated }));
                  }}
                  className="bg-[var(--surface-2)] border-[var(--border)] text-white rounded-lg h-9 text-sm"
                />
              </div>
            ))}

            <Button
              onClick={() => setBuilderData(prev => ({ ...prev, milestones: [...prev.milestones, ""] }))}
              variant="outline"
              className="w-full border-dashed border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Milestone
            </Button>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">Review Custom Rules</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">Confirm your wager rules</p>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
              {builderData.conditions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">CONDITIONS</p>
                  {builderData.conditions.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-[var(--accent)] mt-0.5 shrink-0" />
                      <p className="text-xs">{c.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {builderData.milestones.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">MILESTONES</p>
                  {builderData.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full border border-[var(--accent)] mt-0.5 shrink-0" />
                      <p className="text-xs">{m}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <Button
            onClick={() => setStep(step - 1)}
            variant="outline"
            className="flex-1 border-[var(--border)] text-white rounded-xl h-12"
          >
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            if (step === 3) {
              onComplete(builderData);
            } else {
              setStep(step + 1);
            }
          }}
          className="flex-1 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] rounded-xl h-12 font-bold"
        >
          {step === 3 ? "Apply Rules" : "Continue"}
          {step < 3 && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}