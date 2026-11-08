import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/** msw service worker for `VITE_USE_MOCKS=true npm run dev`. Never imported by a production build. */
export const worker = setupWorker(...handlers);
