import { useEffect, useState, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { registerToastHandler } from "../utils/notify";
import { cn } from "@/lib/utils";

const VARIANT = {
  error: { icon: AlertTriangle, iconClass: "text-alert" },
  success: { icon: CheckCircle2, iconClass: "text-pass" },
  info: { icon: Info, iconClass: "text-steel-300" },
};

const TOAST_CLASS =
  "print-in pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg bg-steel-900 py-3 pl-4 text-left text-sm font-medium text-paper shadow-[0_12px_32px_-8px_rgb(0_0_0/0.5)]";

type ToastItem = {
  id: string;
  message: string;
  variant: "error" | "success" | "info";
  href?: string;
};

const ToastProvider = ({ children }: { children?: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return registerToastHandler(({ message, variant = "error", href }) => {
      const id = crypto.randomUUID();
      // Repeats replace the earlier copy, and only the newest three stay on screen.
      setToasts((prev) =>
        [...prev.filter((toast) => toast.message !== message || toast.variant !== variant), { id, message, variant, href }].slice(-3)
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
          if (toast.href) {
            // A link can't sit inside the dismiss button, so this toast gets its own close button.
            return (
              <div key={toast.id} className={cn(TOAST_CLASS, "pr-12")}>
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", variant.iconClass)} aria-hidden="true" />
                <a href={toast.href} className="underline underline-offset-2">
                  {toast.message}
                </a>
                <button
                  type="button"
                  aria-label={`Dismiss notification: ${toast.message}`}
                  onClick={() => handleDismiss(toast.id)}
                  className="absolute right-1 top-1 grid h-10 w-10 place-items-center text-paper/50 hover:text-paper"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            );
          }
          return (
            <button
              key={toast.id}
              type="button"
              aria-label={`Dismiss notification: ${toast.message}`}
              onClick={() => handleDismiss(toast.id)}
              className={cn(TOAST_CLASS, "pr-10")}
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
