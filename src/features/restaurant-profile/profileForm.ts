import type { FieldPath } from "react-hook-form";
import type { ProfileValues } from "../../lib/schemas";
import { emptyHours } from "./openingHours";
import { WEEKDAYS, type RestaurantProfile, type RestaurantProfileInput } from "./types";

/** Saved profile as form values; with no address of its own the form starts from the legal one. */
export const toProfileValues = (profile: RestaurantProfile | null): ProfileValues => {
  const address = profile?.address ?? profile?.legalAddress;
  return {
    logoUrl: profile?.logoUrl ?? null,
    useLegalAddress: profile ? profile.usesLegalAddress : true,
    street: address?.street ?? "",
    zip: address?.zip ?? "",
    city: address?.city ?? "",
    openingHours: profile?.openingHours ?? emptyHours(),
  };
};

/** The PUT body: no address when the legal one is used, ranges sorted by opening time. */
export const toProfileInput = (values: ProfileValues): RestaurantProfileInput => ({
  logoUrl: values.logoUrl,
  address: values.useLegalAddress
    ? null
    : { street: values.street.trim(), zip: values.zip.trim(), city: values.city.trim() },
  openingHours: Object.fromEntries(
    WEEKDAYS.map((day) => [day, [...values.openingHours[day]].sort((a, b) => a.open.localeCompare(b.open))])
  ) as RestaurantProfileInput["openingHours"],
});

export type ProfileFieldError = { field: FieldPath<ProfileValues>; message: string };

const SERVER_FIELDS: Record<string, FieldPath<ProfileValues>> = {
  logoUrl: "logoUrl",
  "address.street": "street",
  "address.zip": "zip",
  "address.city": "city",
  ...Object.fromEntries(WEEKDAYS.map((day) => [`openingHours.${day}`, `openingHours.${day}` as const])),
};

const validationFields = (error: unknown): Record<string, unknown> => {
  const fields = (error as { response?: { data?: { details?: { fields?: unknown } } } } | null)?.response?.data?.details
    ?.fields;
  return fields && typeof fields === "object" ? (fields as Record<string, unknown>) : {};
};

/** The form fields a 400 VALIDATION answer names. A range's own path (openingHours.tue.0.close) counts for its day. */
export const profileFieldErrors = (error: unknown): ProfileFieldError[] =>
  Object.entries(validationFields(error)).flatMap(([key, message]) => {
    const field = SERVER_FIELDS[key] ?? SERVER_FIELDS[key.split(".").slice(0, 2).join(".")];
    if (!field) {
      return [];
    }
    return [{ field, message: typeof message === "string" && message ? message : "Check this field" }];
  });
