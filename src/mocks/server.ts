import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** msw server for Vitest. Started in `src/test/setupMsw.ts`, reset after every test. */
export const server = setupServer(...handlers);
