/** Where the guest app is served, without a trailing slash. Empty when it is not configured. */
export const guestAppBaseUrl = (): string => String(import.meta.env.VITE_PLATE_VISTA_URL || "").replace(/\/$/, "");

/** The link a table's QR code opens: `/r/<restaurant>/t/<table code>`. */
export const guestTableUrl = (baseUrl: string, slug: string, qrCode: string): string =>
  `${baseUrl}/r/${slug}/t/${qrCode}`;
