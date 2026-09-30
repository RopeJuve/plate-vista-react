import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();
vi.mock("axios", () => ({ default: { post } }));

const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
});

const tokens = await import("./tokens");

describe("refresh tokens", () => {
  beforeEach(() => {
    post.mockReset();
    tokens.clearTokens();
    store.clear();
  });

  it("sends one refresh for parallel callers and saves the rotated pair", async () => {
    tokens.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    post.mockResolvedValue({ data: { accessToken: "access-2", refreshToken: "refresh-2" } });

    const [a, b] = await Promise.all([tokens.refreshSession(), tokens.refreshSession()]);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][1]).toEqual({ refreshToken: "refresh-1" });
    expect(a).toBe("access-2");
    expect(b).toBe("access-2");
    expect(tokens.getAccessToken()).toBe("access-2");
    expect(tokens.getRefreshToken()).toBe("refresh-2");
  });

  it("clears both tokens when the server rejects the refresh token", async () => {
    tokens.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    post.mockRejectedValue({ response: { status: 401 } });

    await expect(tokens.refreshSession()).rejects.toBeInstanceOf(tokens.SessionExpiredError);
    expect(tokens.getAccessToken()).toBeNull();
    expect(tokens.getRefreshToken()).toBeNull();
  });

  it("keeps the tokens on a network error so a later retry can refresh", async () => {
    tokens.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    post.mockRejectedValue(new Error("offline"));

    await expect(tokens.refreshSession()).rejects.toThrow("offline");
    expect(tokens.getRefreshToken()).toBe("refresh-1");
  });
});
