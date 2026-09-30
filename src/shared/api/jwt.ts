/** Reads the payload of a JWT without verifying it. Not used for socket frames. */
export const decodeJwt = (token: string): Record<string, unknown> => {
  const part = token.split(".")[1];
  if (!part) {
    return {};
  }
  try {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

export const asId = (value: unknown): string | null => {
  if (typeof value === "string" && value) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  const record = asRecord(value);
  if (!record) {
    return null;
  }
  if (typeof record.$oid === "string" && record.$oid) {
    return record.$oid;
  }
  if (typeof record._id === "string" && record._id) {
    return record._id;
  }
  if (typeof record.id === "string" && record.id) {
    return record.id;
  }
  return null;
};

export const readRestaurantId = (payload: Record<string, unknown>): string | null => {
  const restaurant = asRecord(payload.restaurant);
  return (
    asId(payload.restaurantId) ||
    asId(payload.restaurant_id) ||
    asId(payload.rid) ||
    asId(payload.restaurant) ||
    (restaurant
      ? asId(restaurant._id) || asId(restaurant.id) || asId(restaurant.restaurantId)
      : null)
  );
};

export const readRestaurantIdFromUnknown = (data: unknown): string | null => {
  const record = asRecord(data);
  if (!record) {
    return asId(data);
  }
  const user = asRecord(record.user);
  const restaurant = asRecord(record.restaurant) || asRecord(user?.restaurant);
  return (
    readRestaurantId(record) ||
    (user ? readRestaurantId(user) : null) ||
    (restaurant
      ? asId(restaurant._id) || asId(restaurant.id) || asId(restaurant.restaurantId)
      : null)
  );
};

const asSlug = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

/** The restaurant's URL slug as a token carries it. Guest links are built from it. */
export const readRestaurantSlug = (payload: Record<string, unknown>): string | null =>
  asSlug(payload.slug) || asSlug(payload.restaurantSlug);

/** The slug from a login or `/auth/user` response, wherever the API put it. */
export const readRestaurantSlugFromUnknown = (data: unknown): string | null => {
  const record = asRecord(data);
  if (!record) {
    return null;
  }
  const user = asRecord(record.user);
  return (
    asSlug(asRecord(record.restaurant)?.slug) ||
    asSlug(asRecord(user?.restaurant)?.slug) ||
    asSlug(record.slug) ||
    asSlug(user?.slug)
  );
};

export const readTokenFromHeaders = (headers: unknown): string | null => {
  if (!headers || typeof headers !== "object") {
    return null;
  }
  const record = headers as {
    authorization?: unknown;
    Authorization?: unknown;
    get?: (name: string) => string | null | undefined;
  };
  const fromGetter = typeof record.get === "function" ? record.get("authorization") : "";
  const raw = record.authorization || record.Authorization || fromGetter || "";
  const authHeader = typeof raw === "string" ? raw : "";
  if (!authHeader) {
    return null;
  }
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader.split(" ")[1] || null;
};
