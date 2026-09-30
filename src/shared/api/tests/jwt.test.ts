import { describe, expect, it } from "vitest";
import {
  decodeJwt,
  readRestaurantId,
  readRestaurantIdFromUnknown,
  readRestaurantSlug,
  readRestaurantSlugFromUnknown,
  readTokenFromHeaders,
} from "../jwt";

describe("readRestaurantId", () => {
  it("reads restaurantId from a JWT payload", () => {
    expect(readRestaurantId({ restaurantId: "rest-1" })).toBe("rest-1");
    expect(readRestaurantId({ restaurant_id: "rest-2" })).toBe("rest-2");
    expect(readRestaurantId({ restaurant: { _id: "rest-3" } })).toBe("rest-3");
    expect(readRestaurantId({ restaurant: { id: "rest-4" } })).toBe("rest-4");
    expect(readRestaurantId({})).toBeNull();
  });
});

describe("readRestaurantIdFromUnknown", () => {
  it("reads nested restaurant ids from login and user payloads", () => {
    expect(readRestaurantIdFromUnknown({ restaurantId: "rest-1" })).toBe("rest-1");
    expect(readRestaurantIdFromUnknown({ user: { restaurantId: "rest-2" } })).toBe("rest-2");
    expect(readRestaurantIdFromUnknown({ restaurant: { _id: "rest-3" } })).toBe("rest-3");
    expect(readRestaurantIdFromUnknown({ user: { restaurant: { id: "rest-4" } } })).toBe("rest-4");
  });
});

describe("restaurant slug", () => {
  it("reads the slug from a token payload", () => {
    expect(readRestaurantSlug({ slug: "harbor" })).toBe("harbor");
    expect(readRestaurantSlug({ restaurantSlug: "quay" })).toBe("quay");
    expect(readRestaurantSlug({ slug: "" })).toBeNull();
    expect(readRestaurantSlug({ slug: 7 })).toBeNull();
  });

  it("reads the slug from login and user responses, the restaurant's own first", () => {
    expect(readRestaurantSlugFromUnknown({ restaurant: { slug: "harbor" }, slug: "other" })).toBe("harbor");
    expect(readRestaurantSlugFromUnknown({ user: { restaurant: { slug: "quay" } } })).toBe("quay");
    expect(readRestaurantSlugFromUnknown({ slug: "mole" })).toBe("mole");
    expect(readRestaurantSlugFromUnknown({ user: { slug: "pier" } })).toBe("pier");
    expect(readRestaurantSlugFromUnknown({ user: {} })).toBeNull();
    expect(readRestaurantSlugFromUnknown(null)).toBeNull();
  });
});

describe("decodeJwt", () => {
  it("reads restaurantId from a token payload", () => {
    const payload = btoa(JSON.stringify({ restaurantId: "rest-1" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(readRestaurantId(decodeJwt(`e30.${payload}.sig`))).toBe("rest-1");
  });
});

describe("readTokenFromHeaders", () => {
  it("reads a bearer token from headers", () => {
    expect(readTokenFromHeaders({ authorization: "Bearer abc" })).toBe("abc");
    expect(readTokenFromHeaders({ get: () => "Bearer xyz" })).toBe("xyz");
    expect(readTokenFromHeaders(null)).toBeNull();
  });
});
