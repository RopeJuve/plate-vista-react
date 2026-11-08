import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ContextProvider } from "./contexts/ContextProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ToastProvider from "./Components/ToastProvider";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

/**
 * `VITE_USE_MOCKS=true npm run dev` answers the payments contract from `src/mocks/`.
 * `import.meta.env.DEV` is false in a build, so the import is dropped and no msw ships.
 */
const startMocks = async () => {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
};

const root = createRoot(rootElement);

void startMocks().then(() => root.render(
  <StrictMode>
    <ContextProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ContextProvider>
  </StrictMode>
));
