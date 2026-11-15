import type { ProfileAddress } from "./types";

/** "Neben dem Mühlweg 26, 65474 Bischofsheim" */
export const addressLine = (address: ProfileAddress) => `${address.street}, ${address.zip} ${address.city}`;

// The restaurant's name first, so Google lands on its place pin rather than a bare street address.
const placeQuery = (name: string, address: ProfileAddress) => `${name}, ${addressLine(address)}`;

/** Opens Google Maps (app or site) on the restaurant. No key, nothing loads until the guest taps. */
export const mapsSearchUrl = (name: string, address: ProfileAddress) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery(name, address))}`;

/** The Maps Embed API iframe; null without a key, so the footer shows only the link. */
export const mapsEmbedUrl = (key: string | undefined, name: string, address: ProfileAddress) =>
  key
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(placeQuery(name, address))}`
    : null;
