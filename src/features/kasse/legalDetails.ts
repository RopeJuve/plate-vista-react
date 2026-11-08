import type { LegalDetailsValues } from "../../lib/schemas";
import type { LegalDetails } from "../../shared/api/payments";

export type LegalField = keyof LegalDetailsValues;

export type LegalFieldError = { field: LegalField; message: string };

/** The server names address fields by their path in `LegalDetails`; the form keeps them flat. */
const SERVER_FIELDS: Record<string, LegalField> = {
  legalName: "legalName",
  "address.street": "street",
  "address.zip": "zip",
  "address.city": "city",
  taxNumber: "taxNumber",
  vatId: "vatId",
};

const FIELD_DEFAULTS: Record<LegalField, string> = {
  legalName: "Check the legal name",
  street: "Check the street",
  zip: "Check the ZIP",
  city: "Check the city",
  taxNumber: "Check the tax number",
  vatId: "Check the VAT ID",
};

const filled = (value?: string) => Boolean(value?.trim());

/** Saved details as form values; nothing saved yet gives an empty form. */
export const toLegalValues = (details: LegalDetails | null): LegalDetailsValues => ({
  legalName: details?.legalName ?? "",
  street: details?.address?.street ?? "",
  zip: details?.address?.zip ?? "",
  city: details?.address?.city ?? "",
  taxNumber: details?.taxNumber ?? "",
  vatId: details?.vatId ?? "",
});

/** The PUT body: trimmed, in Germany, without an empty tax number or VAT ID. */
export const toLegalDetails = (values: LegalDetailsValues): LegalDetails => {
  const taxNumber = values.taxNumber.trim();
  const vatId = values.vatId.trim();
  return {
    legalName: values.legalName.trim(),
    address: { street: values.street.trim(), zip: values.zip.trim(), city: values.city.trim(), country: "DE" },
    ...(taxNumber && { taxNumber }),
    ...(vatId && { vatId }),
  };
};

/** Enough for a German receipt and for activating the TSE. */
export const isLegalComplete = (details: LegalDetails | null) =>
  Boolean(
    details &&
      filled(details.legalName) &&
      filled(details.address?.street) &&
      /^\d{5}$/.test(details.address?.zip?.trim() ?? "") &&
      filled(details.address?.city) &&
      (filled(details.taxNumber) || filled(details.vatId))
  );

const validationFields = (error: unknown): Record<string, unknown> => {
  const fields = (error as { response?: { data?: { details?: { fields?: unknown } } } } | null)?.response?.data?.details
    ?.fields;
  return fields && typeof fields === "object" ? (fields as Record<string, unknown>) : {};
};

/** The form fields a 400 VALIDATION answer names, each with a readable message. */
export const legalFieldErrors = (error: unknown): LegalFieldError[] =>
  Object.entries(validationFields(error)).flatMap(([key, message]) => {
    const field = SERVER_FIELDS[key];
    if (!field) {
      return [];
    }
    return [{ field, message: typeof message === "string" && message ? message : FIELD_DEFAULTS[field] }];
  });
