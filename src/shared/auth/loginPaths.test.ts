import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
});

const paths = await import("./loginPaths");

describe("login paths", () => {
  beforeEach(() => store.clear());

  it("sends a first-time visitor to the owner login", () => {
    expect(paths.getLoginPath()).toBe("/login");
  });

  it("asks staff for their restaurant until the device remembers one", () => {
    paths.rememberLoginKind("staff");
    expect(paths.getLoginPath()).toBe("/staff/login");
    paths.rememberStaffRestaurant("  Rope-Restaurant ");
    expect(paths.getLoginPath()).toBe("/staff/rope-restaurant/login");
  });

  it("sends an owner back to the owner login even on a staff device", () => {
    paths.rememberStaffRestaurant("harbor");
    paths.rememberLoginKind("owner");
    expect(paths.getLoginPath()).toBe("/login");
    expect(paths.staffLoginPath()).toBe("/staff/harbor/login");
  });
});
