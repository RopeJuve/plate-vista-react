import { useEffect, useState } from "react";
import { registerToastHandler } from "../utils/notify";

const VARIANT_CLASS = {
  error: "bg-red-600",
  success: "bg-green-600",
  info: "bg-blue-600",
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return registerToastHandler(({ message, variant = "error" }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    });
  }, []);

  const handleDismiss = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div
        className="fixed top-4 right-4 z-[2000] flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            aria-label={`Dismiss notification: ${toast.message}`}
            onClick={() => handleDismiss(toast.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleDismiss(toast.id);
              }
            }}
            className={`max-w-sm rounded-lg px-4 py-3 text-left text-white shadow-lg ${
              VARIANT_CLASS[toast.variant] || VARIANT_CLASS.error
            }`}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
