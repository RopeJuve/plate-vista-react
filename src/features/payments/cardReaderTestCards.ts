import type { TestCard } from "../../shared/api/payments";

/** The Stripe test cards a Simulated Reader can be shown that do not go through, as the developer buttons name them. */
export const DECLINED_TEST_CARDS: { card: Exclude<TestCard, "APPROVED">; label: string }[] = [
  { card: "DECLINED", label: "Generic decline" },
  { card: "INSUFFICIENT_FUNDS", label: "Insufficient funds" },
  { card: "LOST_CARD", label: "Lost card" },
  { card: "STOLEN_CARD", label: "Stolen card" },
  { card: "EXPIRED_CARD", label: "Expired card" },
  { card: "PROCESSING_ERROR", label: "Processing error" },
];
