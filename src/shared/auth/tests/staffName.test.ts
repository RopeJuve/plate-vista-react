import { describe, expect, it } from "vitest";
import { initialOf, staffName } from "../staffName";

describe("staff name", () => {
  it("prefers the username, then the email, then the fallback", () => {
    expect(staffName({ employee: "maria", email: "m@x.de" }, "Staff")).toBe("maria");
    expect(staffName({ email: "m@x.de" }, "Staff")).toBe("m@x.de");
    expect(staffName(null, "Owner")).toBe("Owner");
  });

  it("badges an unnamed person with a question mark", () => {
    expect(initialOf("maria")).toBe("m");
    expect(initialOf("")).toBe("?");
    expect(initialOf(undefined)).toBe("?");
  });
});
