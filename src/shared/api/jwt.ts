/** Reads the payload of a JWT without verifying it. Not used for socket frames. */
export const decodeJwt = (token: string): Record<string, unknown> => {
  const part = token.split(".")[1];
  if (!part) {
    return {};
  }
  try {
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
};

export const readTokenFromHeaders = (headers: {
  authorization?: unknown;
  Authorization?: unknown;
  get?: (name: string) => string | null;
}): string | null => {
  const fromGetter = typeof headers.get === "function" ? headers.get("authorization") : "";
  const raw = headers.authorization || headers.Authorization || fromGetter || "";
  const authHeader = typeof raw === "string" ? raw : "";
  if (!authHeader) {
    return null;
  }
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader.split(" ")[1] || null;
};
