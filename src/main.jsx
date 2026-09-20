import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ContextProvider } from "./contexts/ContextProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ToastProvider from "./Components/ToastProvider";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ContextProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ContextProvider>
  </StrictMode>
);
