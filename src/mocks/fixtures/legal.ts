import type { LegalDetails } from "../../shared/api/payments";

/** A restaurant that has not filled in its legal details yet. */
export const emptyLegalDetails: LegalDetails = {
  legalName: "",
  address: { street: "", zip: "", city: "", country: "DE" },
};

export const completeLegalDetails: LegalDetails = {
  legalName: "Plate Vista Gastro GmbH",
  address: { street: "Hauptstraße 1", zip: "10115", city: "Berlin", country: "DE" },
  taxNumber: "30/123/45678",
  vatId: "DE123456789",
};
