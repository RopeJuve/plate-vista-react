export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/** "HH:MM" in the restaurant's own timezone; a close before the open runs past midnight. */
export type OpeningRange = { open: string; close: string };

export type OpeningHours = Record<Weekday, OpeningRange[]>;

export type ProfileAddress = { street: string; zip: string; city: string };

/** What the dashboard edits (GET/PUT /restaurant/profile). */
export type RestaurantProfile = {
  logoUrl: string | null;
  /** null: guests see the legal address. */
  address: ProfileAddress | null;
  usesLegalAddress: boolean;
  legalAddress: ProfileAddress | null;
  openingHours: OpeningHours;
};

/** What the PUT takes. */
export type RestaurantProfileInput = {
  logoUrl: string | null;
  address: ProfileAddress | null;
  openingHours: OpeningHours;
};

/** What guests see (GET /r/:slug/profile). */
export type PublicProfile = {
  name: string;
  logoUrl: string | null;
  address: ProfileAddress | null;
  openingHours: OpeningHours;
  timezone: string;
};
