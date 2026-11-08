import { describe, expect, it } from "vitest";
import { completeLegalDetails, emptyLegalDetails } from "../../../mocks/fixtures/legal";
import { isLegalComplete, legalFieldErrors, toLegalDetails, toLegalValues } from "../legalDetails";

const values = {
  legalName: " Plate Vista Gastro GmbH ",
  street: "Hauptstraße 1",
  zip: "10115",
  city: "Berlin",
  taxNumber: "",
  vatId: " DE123456789 ",
};

describe("toLegalValues", () => {
  it("flattens saved details into form values", () => {
    expect(toLegalValues(completeLegalDetails)).toEqual({
      legalName: "Plate Vista Gastro GmbH",
      street: "Hauptstraße 1",
      zip: "10115",
      city: "Berlin",
      taxNumber: "30/123/45678",
      vatId: "DE123456789",
    });
  });

  it("gives empty strings for missing details", () => {
    expect(toLegalValues(null)).toEqual({ legalName: "", street: "", zip: "", city: "", taxNumber: "", vatId: "" });
    expect(toLegalValues(emptyLegalDetails).taxNumber).toBe("");
  });
});

describe("toLegalDetails", () => {
  it("trims, fixes the country to Germany and leaves out an empty tax number", () => {
    expect(toLegalDetails(values)).toEqual({
      legalName: "Plate Vista Gastro GmbH",
      address: { street: "Hauptstraße 1", zip: "10115", city: "Berlin", country: "DE" },
      vatId: "DE123456789",
    });
  });
});

describe("isLegalComplete", () => {
  it("needs name, address and one of tax number or VAT ID", () => {
    expect(isLegalComplete(completeLegalDetails)).toBe(true);
    expect(isLegalComplete({ ...completeLegalDetails, taxNumber: undefined })).toBe(true);
    expect(isLegalComplete({ ...completeLegalDetails, taxNumber: "", vatId: undefined })).toBe(false);
    expect(isLegalComplete(emptyLegalDetails)).toBe(false);
    expect(isLegalComplete(null)).toBe(false);
  });
});

describe("legalFieldErrors", () => {
  const validation = (fields: unknown) => ({ response: { status: 400, data: { code: "VALIDATION", details: { fields } } } });

  it("maps the server's field paths onto form fields", () => {
    expect(legalFieldErrors(validation({ legalName: "Required", "address.zip": "Must be 5 digits", vatId: "Invalid" }))).toEqual([
      { field: "legalName", message: "Required" },
      { field: "zip", message: "Must be 5 digits" },
      { field: "vatId", message: "Invalid" },
    ]);
  });

  it("falls back to a readable message and ignores unknown fields", () => {
    expect(legalFieldErrors(validation({ "address.city": "", owner: "x" }))).toEqual([
      { field: "city", message: "Check the city" },
    ]);
  });

  it("is empty for anything that is not a validation answer", () => {
    expect(legalFieldErrors(new Error("offline"))).toEqual([]);
  });
});
