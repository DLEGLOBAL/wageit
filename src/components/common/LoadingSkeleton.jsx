import React from "react";
import { motion } from "framer-motion";

export function WagerSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-[var(--surface-2)] rounded-lg w-3/4 animate-pulse" />
          <div className="h-3 bg-[var(--surface-2)] rounded w-1/4 animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-[var(--surface-2)] rounded-full animate-pulse" />
      </div>
      <div className="h-4 bg-[var(--surface-2)] rounded w-full animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="h-8 w-20 bg-[var(--surface-2)] rounded-lg animate-pulse" />
        <div className="h-6 w-16 bg-[var(--surface-2)] rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-[var(--surface-2)] animate-pulse mb-4" />
        <div className="h-6 w-32 bg-[var(--surface-2)] rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-[var(--surface-2)] rounded animate-pulse" />
      </div>
    </div>
  );
}