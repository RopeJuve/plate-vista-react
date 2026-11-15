type Env = Record<string, string | boolean | undefined>;

export type FooterLink = { label: string; href: string };

export type FooterConfig = {
  /** Google Maps Embed API key; without it the footer offers only the "Open in Google Maps" link. */
  mapsEmbedKey: string | undefined;
  /** Plate Vista's own legal pages; a link without a URL is left out. */
  legalLinks: FooterLink[];
};

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

export const footerConfig = (env: Env = import.meta.env): FooterConfig => ({
  mapsEmbedKey: text(env.VITE_GOOGLE_MAPS_EMBED_KEY),
  legalLinks: [
    { label: "Legal notice", href: text(env.VITE_IMPRINT_URL) },
    { label: "Privacy policy", href: text(env.VITE_PRIVACY_URL) },
  ].filter((link): link is FooterLink => Boolean(link.href)),
});
