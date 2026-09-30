/**
 * FE-18 — Money in cents.
 *
 * The API sends every price as integer cents (`unitPriceCents`, `lineTotalCents`,
 * `totalCents`, `priceCents`). This module is the ONLY place in the app allowed
 * to multiply/divide a price by 100. Never do float math on prices in the UI —
 * sum cents as integers, then format the total once.
 */

const DEFAULT_CURRENCY = "EUR";
const DEFAULT_LOCALE = "de-DE";

/**
 * Formats an integer amount of cents as a localized currency string.
 *
 * @example formatCents(450) // "4,50 €"
 * @example formatCents(0) // "0,00 €"
 */
export const formatCents = (
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string => {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  return formatter.format(safeCents / 100);
};

/** Sums an array of integer cent amounts using integer math (no float drift). */
export const sumCents = (amounts: Array<number | null | undefined>): number =>
  amounts.reduce<number>((total, value) => total + (Number.isFinite(value) ? (value as number) : 0), 0);

/** Multiplies a unit price in cents by an integer quantity, staying in integer cents. */
export const lineTotalCents = (unitPriceCents: number, quantity: number): number =>
  Math.round(unitPriceCents) * Math.round(quantity);

/** Cents as a plain euro number, for chart axes. Never feed it back into price math. */
export const centsToEurosForChart = (cents: number): number =>
  (Number.isFinite(cents) ? cents : 0) / 100;

/**
 * Converts a euro amount to integer cents.
 * This is the only place a price may be scaled by 100.
 */
export const eurosToCents = (amount: number | string): number => {
  if (typeof amount === "number") {
    if (!Number.isFinite(amount)) {
      return 0;
    }
    return Math.round(amount * 100);
  }

  const trimmed = amount.trim();
  if (!trimmed) {
    return 0;
  }

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [wholeRaw, fractionRaw = ""] = unsigned.split(".");
  const whole = Number(wholeRaw || "0");
  if (!Number.isFinite(whole)) {
    return 0;
  }
  const fraction = Number((fractionRaw.replace(/\D/g, "") + "00").slice(0, 2));
  const cents = whole * 100 + (Number.isFinite(fraction) ? fraction : 0);
  return negative ? -cents : cents;
};

/** Reads a price that may already be cents, or a legacy euro amount. */
export const readCents = (cents: unknown, legacyEuros?: unknown): number => {
  if (typeof cents === "number" && Number.isFinite(cents)) {
    return Math.round(cents);
  }
  if (typeof legacyEuros === "number" || typeof legacyEuros === "string") {
    return eurosToCents(legacyEuros);
  }
  return 0;
};
