import type { PublicProfile, RestaurantProfile } from "../../features/restaurant-profile/types";

const noHours = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

/** A restaurant that has not set up its profile: guests see its legal address. */
export const emptyProfile: RestaurantProfile = {
  logoUrl: null,
  address: null,
  usesLegalAddress: true,
  legalAddress: { street: "Hauptstraße 1", zip: "10115", city: "Berlin" },
  openingHours: noHours,
};

export const publicProfile: PublicProfile = {
  name: "Trattoria Sole",
  logoUrl: "https://res.cloudinary.com/demo/image/upload/v1/plate-vista/r1/logo/sole.png",
  address: { street: "Neben dem Mühlweg 26", zip: "65474", city: "Bischofsheim" },
  openingHours: { ...noHours, mon: [{ open: "11:00", close: "22:00" }], fri: [{ open: "18:00", close: "02:00" }] },
  timezone: "Europe/Berlin",
};
