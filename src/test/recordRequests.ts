import { afterEach } from "vitest";
import { server } from "../mocks/server";

export type RecordedRequest = {
  method: string;
  /** Path without the origin and `/api/v1`, plus the query string. */
  path: string;
  authorization: string | null;
  body: unknown;
};

const readBody = async (request: Request) => {
  const text = await request.clone().text();
  return text ? JSON.parse(text) : undefined;
};

/**
 * Records every request the msw server sees in this test file, so an API test can
 * check method, path, body and auth header against the real handler.
 */
export const recordRequests = () => {
  const requests: RecordedRequest[] = [];
  const pending: Promise<void>[] = [];

  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    pending.push(
      readBody(request).then((body) => {
        requests.push({
          method: request.method,
          path: `${url.pathname.replace(/^\/api\/v1/, "")}${url.search}`,
          authorization: request.headers.get("authorization"),
          body,
        });
      })
    );
  });

  afterEach(() => {
    requests.length = 0;
    pending.length = 0;
  });

  /** The one request the test made, once its body has been read. */
  const only = async () => {
    await Promise.all(pending);
    if (requests.length !== 1) {
      throw new Error(`expected one request, saw ${requests.length}`);
    }
    return requests[0];
  };

  return { only };
};
