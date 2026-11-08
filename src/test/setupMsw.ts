import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "../mocks/server";

// Every test starts from the default contract handlers; a test that calls
// `mockPayResponse(...)` (or `server.use(...)`) only changes its own case.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
