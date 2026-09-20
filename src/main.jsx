import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CartProvider } from "./CartContext";
import { ContextProvider } from "./contexts/ContextProvider";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import ToastProvider from "./Components/ToastProvider";

import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXdfc3RdQ2dcUUB1V0Q="
);

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ContextProvider>
      <CartProvider>
        <AuthProvider>
          <ToastProvider>
            <WebSocketProvider>
              <App />
            </WebSocketProvider>
          </ToastProvider>
        </AuthProvider>
      </CartProvider>
    </ContextProvider>
  </StrictMode>
);
