import { describe, expect, it } from "vitest";
import { joinFailureMessage } from "../joinMessages";

describe("join messages", () => {
  it("sends a locked-out guest to the waiter and a bad scan back to the QR code", () => {
    expect(joinFailureMessage({ status: "tooManyTries" })).toMatch(/ask your waiter/);
    expect(joinFailureMessage({ status: "notFound" })).toMatch(/scan the QR code again/);
  });

  it("passes on the server's reason, falling back to scanning again", () => {
    expect(joinFailureMessage({ status: "error", message: "Restaurant closed" })).toBe("Restaurant closed");
    expect(joinFailureMessage({ status: "error", message: "" })).toMatch(/scan the QR code again/);
  });

  it("says nothing for results the join form handles", () => {
    expect(joinFailureMessage({ status: "needsCode" })).toBe("");
    expect(joinFailureMessage({ status: "wrongCode" })).toBe("");
  });
});
