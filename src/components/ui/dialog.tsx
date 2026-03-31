"use client";

import { cn } from "@/lib/utils/cn";

interface DialogProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Glassmorphism modal overlay — slides up on mobile, centered on desktop.
 * Consumer is responsible for the title, form, and action buttons inside.
 */
export function Dialog({ onClose, children, className }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Card */}
      <div
        className={cn(
          "relative w-full sm:max-w-md glass-elevated rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
