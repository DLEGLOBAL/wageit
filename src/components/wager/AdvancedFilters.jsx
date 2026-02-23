import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SlidersHorizontal, X } from "lucide-react";

export default function AdvancedFilters({ filters, onApply }) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const reset = {
      wagerTypes: [],
      minStake: 0,
      maxStake: 10000,
      expiringSoon: false,
      keywords: ""
    };
    setLocalFilters(reset);
    onApply(reset);
  };

  const activeFilterCount = 
    localFilters.wagerTypes.length + 
    (localFilters.expiringSoon ? 1 : 0) + 
    (localFilters.keywords ? 1 : 0) +
    ((localFilters.minStake > 0 || localFilters.maxStake < 10000) ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[var(--border)] hover:bg-[var(--surface)] rounded-xl px-4 relative">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-[var(--accent)] text-black text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Wager Types */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Wager Type</Label>
            <div className="flex flex-wrap gap-2">
              {["skill_based", "event_outcome", "time_challenge"].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const types = localFilters.wagerTypes.includes(type)
                      ? localFilters.wagerTypes.filter(t => t !== type)
                      : [...localFilters.wagerTypes, type];
                    setLocalFilters({ ...localFilters, wagerTypes: types });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    localFilters.wagerTypes.includes(type)
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {type.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Stake Range */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Stake Range: ${localFilters.minStake} - ${localFilters.maxStake}
            </Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-[var(--text-muted)]">Min Stake</Label>
                <Input
                  type="number"
                  value={localFilters.minStake}
                  onChange={e => setLocalFilters({ ...localFilters, minStake: Number(e.target.value) })}
                  className="bg-[var(--surface-2)] border-[var(--border)] mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-[var(--text-muted)]">Max Stake</Label>
                <Input
                  type="number"
                  value={localFilters.maxStake}
                  onChange={e => setLocalFilters({ ...localFilters, maxStake: Number(e.target.value) })}
                  className="bg-[var(--surface-2)] border-[var(--border)] mt-1"
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Keywords</Label>
            <Input
              placeholder="Search in descriptions..."
              value={localFilters.keywords}
              onChange={e => setLocalFilters({ ...localFilters, keywords: e.target.value })}
              className="bg-[var(--surface-2)] border-[var(--border)]"
            />
          </div>

          {/* Expiring Soon */}
          <div className="flex items-center justify-between bg-[var(--surface-2)] rounded-xl p-3">
            <div>
              <p className="text-sm font-medium">Expiring Soon</p>
              <p className="text-xs text-[var(--text-muted)]">Within 24 hours</p>
            </div>
            <Switch
              checked={localFilters.expiringSoon}
              onCheckedChange={val => setLocalFilters({ ...localFilters, expiringSoon: val })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-[var(--border)] hover:bg-[var(--surface-2)]"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)]"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}