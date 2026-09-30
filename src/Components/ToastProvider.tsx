import { useEffect, useState, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { registerToastHandler } from "../utils/notify";
import { cn } from "@/lib/utils";

const VARIANT = {
  error: { icon: AlertTriangle, iconClass: "text-alert" },
  success: { icon: CheckCircle2, iconClass: "text-pass" },
  info: { icon: Info, iconClass: "text-steel-300" },
};

type ToastItem = {
  id: string;
  message: string;
  variant: "error" | "success" | "info";
};

const ToastProvider = ({ children }: { children?: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return registerToastHandler(({ message, variant = "error" }) => {
      const id = crypto.randomUUID();
      // Repeats replace the earlier copy, and only the newest three stay on screen.
      setToasts((prev) =>
        [...prev.filter((toast) => toast.message !== message || toast.variant !== variant), { id, message, variant }].slice(-3)
      );
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    });
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 top-3 z-[2000000] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4 sm:top-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const variant = VARIANT[toast.variant];
          const Icon = variant.icon;
          return (
            <button
              key={toast.id}
              type="button"
              aria-label={`Dismiss notification: ${toast.message}`}
              onClick={() => handleDismiss(toast.id)}
              className="print-in pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg bg-steel-900 py-3 pl-4 pr-10 text-left text-sm font-medium text-paper shadow-[0_12px_32px_-8px_rgb(0_0_0/0.5)]"
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", variant.iconClass)} aria-hidden="true" />
              <span>{toast.message}</span>
              <X className="absolute right-3 top-3 h-4 w-4 text-paper/50" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ToastProvider;
