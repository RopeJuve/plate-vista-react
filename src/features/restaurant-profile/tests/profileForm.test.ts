import { describe, expect, it } from "vitest";
import { profileSchema } from "../../../lib/schemas";
import { footerConfig } from "../footerConfig";
import { logoFileProblem } from "../logoFile";
import { addressLine, mapsEmbedUrl, mapsSearchUrl } from "../mapLinks";
import { emptyHours } from "../openingHours";
import { profileFieldErrors, toProfileInput, toProfileValues } from "../profileForm";
import type { RestaurantProfile } from "../types";

const legalAddress = { street: "Hauptstraße 1", zip: "10115", city: "Berlin" };
const ownAddress = { street: "Neben dem Mühlweg 26", zip: "65474", city: "Bischofsheim" };

const saved = (overrides: Partial<RestaurantProfile> = {}): RestaurantProfile => ({
  logoUrl: null,
  address: null,
  usesLegalAddress: true,
  legalAddress,
  openingHours: emptyHours(),
  ...overrides,
});

describe("toProfileValues", () => {
  it("starts from the legal address when the profile has none", () => {
    expect(toProfileValues(saved())).toMatchObject({ useLegalAddress: true, ...legalAddress });
  });

  it("shows the profile's own address when it has one", () => {
    expect(toProfileValues(saved({ address: ownAddress, usesLegalAddress: false }))).toMatchObject({
      useLegalAddress: false,
      ...ownAddress,
    });
  });

  it("gives an empty form before anything loads", () => {
    expect(toProfileValues(null)).toEqual({
      logoUrl: null,
      useLegalAddress: true,
      street: "",
      zip: "",
      city: "",
      openingHours: emptyHours(),
    });
  });
});

describe("toProfileInput", () => {
  it("sends no address when the legal one is used, and sorts each day's times", () => {
    const values = toProfileValues(saved());
    values.openingHours.mon = [{ open: "17:00", close: "22:00" }, { open: "11:00", close: "15:00" }];
    expect(toProfileInput(values)).toEqual({
      logoUrl: null,
      address: null,
      openingHours: { ...emptyHours(), mon: [{ open: "11:00", close: "15:00" }, { open: "17:00", close: "22:00" }] },
    });
  });

  it("sends the trimmed own address", () => {
    const values = { ...toProfileValues(saved()), useLegalAddress: false, street: " Neben dem Mühlweg 26 ", zip: "65474", city: "Bischofsheim " };
    expect(toProfileInput(values).address).toEqual(ownAddress);
  });
});

describe("profileSchema", () => {
  it("ignores the address fields while the legal address is used", () => {
    expect(profileSchema.safeParse({ ...toProfileValues(null), useLegalAddress: true }).success).toBe(true);
  });

  it("checks the own address and each day's opening times", () => {
    const result = profileSchema.safeParse({
      ...toProfileValues(null),
      useLegalAddress: false,
      street: "",
      zip: "123",
      city: "X",
      openingHours: { ...emptyHours(), wed: [{ open: "11:00", close: "15:00" }, { open: "14:00", close: "22:00" }] },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["street", "zip", "openingHours.wed"]);
  });
});

describe("profileFieldErrors", () => {
  const validation = (fields: Record<string, unknown>) => ({ response: { data: { code: "VALIDATION", details: { fields } } } });

  it("maps the server's paths onto form fields, a range's path onto its day", () => {
    expect(
      profileFieldErrors(
        validation({ "address.zip": "Postcode must be 5 digits", "openingHours.tue.0.close": "", logoUrl: "Upload the logo here", other: "x" })
      )
    ).toEqual([
      { field: "zip", message: "Postcode must be 5 digits" },
      { field: "openingHours.tue", message: "Check this field" },
      { field: "logoUrl", message: "Upload the logo here" },
    ]);
    expect(profileFieldErrors(new Error("network"))).toEqual([]);
  });
});

describe("map links", () => {
  it("searches Google Maps for the restaurant's name and address", () => {
    expect(addressLine(ownAddress)).toBe("Neben dem Mühlweg 26, 65474 Bischofsheim");
    expect(mapsSearchUrl("Puzzle Kids", ownAddress)).toBe(
      "https://www.google.com/maps/search/?api=1&query=Puzzle%20Kids%2C%20Neben%20dem%20M%C3%BChlweg%2026%2C%2065474%20Bischofsheim"
    );
  });

  it("only builds an embed with a key", () => {
    expect(mapsEmbedUrl(undefined, "Puzzle Kids", ownAddress)).toBeNull();
    expect(mapsEmbedUrl("k&1", "Puzzle Kids", ownAddress)).toMatch(
      /^https:\/\/www\.google\.com\/maps\/embed\/v1\/place\?key=k%261&q=Puzzle%20Kids%2C/
    );
  });
});

describe("footerConfig", () => {
  it("leaves out legal links without a URL and blank keys", () => {
    expect(footerConfig({ VITE_GOOGLE_MAPS_EMBED_KEY: " ", VITE_PRIVACY_URL: "https://platevista.de/privacy" })).toEqual({
      mapsEmbedKey: undefined,
      legalLinks: [{ label: "Privacy policy", href: "https://platevista.de/privacy" }],
    });
    expect(footerConfig({}).legalLinks).toEqual([]);
  });
});

describe("logoFileProblem", () => {
  const MB = 1024 * 1024;
  it("takes PNG, JPG and WebP up to the limit", () => {
    expect(logoFileProblem({ type: "image/png", size: 2 * MB }, 2 * MB)).toBeNull();
    expect(logoFileProblem({ type: "image/webp", size: 10 }, 2 * MB)).toBeNull();
  });

  it("refuses SVG and files over the limit", () => {
    expect(logoFileProblem({ type: "image/svg+xml", size: 10 }, 2 * MB)).toBe("Use a PNG, JPG or WebP image");
    expect(logoFileProblem({ type: "image/jpeg", size: 2 * MB + 1 }, 2 * MB)).toBe("The logo must be 2 MB or smaller");
  });
});
