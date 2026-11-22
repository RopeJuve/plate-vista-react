import type { CardReader, CardReaderErrorBody } from "../../shared/api/payments";

/** The readers Stripe sells for server-driven payments, by Stripe's device type. */
const DEVICE_NAMES: Record<string, string> = {
  stripe_s700: "Stripe Reader S700",
  stripe_s710: "Stripe Reader S710",
  bbpos_wisepos_e: "BBPOS WisePOS E",
  simulated_wisepos_e: "Simulated WisePOS E",
  simulated_stripe_s700: "Simulated S700",
};

/** A device type staff recognise; one Stripe adds later reads as Stripe sends it. */
export const deviceName = (deviceType: string) => DEVICE_NAMES[deviceType] ?? deviceType;

/** Readers in the order the API lists them: by name. */
export const withReader = (readers: CardReader[], reader: CardReader): CardReader[] =>
  [...readers, reader].sort((a, b) => a.name.localeCompare(b.name));

export const withoutReader = (readers: CardReader[], id: string): CardReader[] =>
  readers.filter((reader) => reader.id !== id);

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: Partial<CardReaderErrorBody> } } | null)?.response;

/** 503 `STRIPE_NOT_CONFIGURED`: this server has no Stripe keys, so there are no card readers at all. */
export const stripeNotConfigured = (error: unknown) => {
  const answer = errorAnswer(error);
  return answer?.status === 503 && answer.data?.code === "STRIPE_NOT_CONFIGURED";
};

/** 404 on remove: the reader is already gone. */
export const readerGone = (error: unknown) => errorAnswer(error)?.status === 404;

/** What went wrong adding or removing a reader, as one sentence for the owner or admin. */
export const cardReaderErrorMessage = (error: unknown): string => {
  const data = errorAnswer(error)?.data;
  switch (data?.code) {
    case "CARD_READER_CODE_INVALID":
      return "That registration code doesn't work. It may be mistyped, expired or already used: generate a new one on the reader and try again.";
    case "PAYOUT_ACCOUNT_NOT_READY":
      return "The Payout Account can't take payments yet, so no reader can be added.";
    case "RESTAURANT_DETAILS_MISSING":
      return "Fill in the legal details first: Stripe needs the restaurant's address for its readers.";
    case "SIMULATED_READER_LIVE_MODE":
      return "Simulated readers only exist in test mode.";
    case "CARD_READER_BUSY": {
      const table = data.details?.tableNumber;
      return table === undefined
        ? "This reader is taking a payment. Cancel that payment first."
        : `This reader is taking a payment for table ${table}. Cancel that payment first.`;
    }
    case "VALIDATION":
      return "Check the code and the name, then try again.";
    case "PAYMENT_PROVIDER_ERROR":
      return "Stripe didn't answer. Please try again.";
    case "STRIPE_NOT_CONFIGURED":
      return "Card readers aren't available on this server yet.";
    default:
      return "Something went wrong. Please try again.";
  }
};
