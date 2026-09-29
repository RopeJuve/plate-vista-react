import { clearTokens } from "../shared/api/tokens";
import { getLoginPath } from "../shared/auth/loginPaths";

const AUTH_MESSAGE_KEY = "authMessage";

export const AUTH_EVENTS = {
  LOGOUT: "auth:logout",
};

type ToastVariant = "error" | "success" | "info";

type ToastPayload = {
  message: string;
  variant?: ToastVariant;
};

type ToastHandler = (payload: ToastPayload) => void;

let toastHandler: ToastHandler | null = null;

export const registerToastHandler = (handler: ToastHandler) => {
  toastHandler = handler;
  return () => {
    if (toastHandler === handler) {
      toastHandler = null;
    }
  };
};

export const apiMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) {
      return message;
    }
  }
  return fallback;
};

export const notify = (message: string, variant: ToastVariant = "error") => {
  if (!message) {
    return;
  }

  if (toastHandler) {
    toastHandler({ message, variant });
    return;
  }

  window.dispatchEvent(
    new CustomEvent("app:toast", { detail: { message, variant } })
  );
};

export const setSessionMessage = (message: string) => {
  sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
};

export const consumeSessionMessage = () => {
  const message = sessionStorage.getItem(AUTH_MESSAGE_KEY);
  if (message) {
    sessionStorage.removeItem(AUTH_MESSAGE_KEY);
  }
  return message;
};

export const triggerUnauthorized = () => {
  setSessionMessage("Session expired");
  clearTokens();
  localStorage.removeItem("user");
  window.dispatchEvent(
    new CustomEvent(AUTH_EVENTS.LOGOUT, { detail: { reason: "session-expired" } })
  );

  const isGuestTable = /^\/r\/[^/]+\/t\//.test(window.location.pathname);
  if (isGuestTable) {
    return;
  }

  const loginPath = getLoginPath();
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
};
