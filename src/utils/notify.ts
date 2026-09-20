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

export const getLoginPath = () => {
  const restaurantId = localStorage.getItem("restaurantId");
  return restaurantId ? `/${restaurantId}` : "/";
};

export const triggerUnauthorized = () => {
  setSessionMessage("Session expired");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.dispatchEvent(
    new CustomEvent(AUTH_EVENTS.LOGOUT, { detail: { reason: "session-expired" } })
  );

  const isGuestTable = window.location.pathname.startsWith("/table/");
  if (isGuestTable) {
    return;
  }

  const loginPath = getLoginPath();
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
};
