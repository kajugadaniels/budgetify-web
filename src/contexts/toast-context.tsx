"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
    info: (msg) => push("info", msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Internal hook (used by useToast wrapper) ──────────────────────────────────

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return ctx;
}

// ── Toast UI ──────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { dot: string; border: string }> = {
  success: { dot: "bg-success", border: "border-success/30" },
  error: { dot: "bg-danger", border: "border-danger/30" },
  info: { dot: "bg-primary", border: "border-primary/30" },
};

function ToastPortal({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { dot, border } = TYPE_STYLES[toast.type];

  return (
    <div
      className={`pointer-events-auto glass-panel rounded-xl px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-sm border ${border}`}
    >
      <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${dot}`} />
      <p className="text-sm text-text-primary flex-1 leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="text-text-secondary hover:text-text-primary transition-colors text-xs leading-none mt-0.5 shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
