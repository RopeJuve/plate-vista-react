import { ORDER_STATUS_LABEL, type OrderStatus } from "../../shared/realtime/protocol";

/**
 * Keyed by protocol `OrderStatus`, the lowercase values the API actually sends.
 * Same meaning as on the board: signal = new, ink = on the line, green = done.
 */
export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-signal text-ink",
  accepted: "bg-ink text-paper",
  preparing: "bg-ink text-paper",
  ready: "bg-pass text-ink",
  served: "bg-pass/15 text-pass-ink",
  cancelled: "bg-ink/10 text-ink-soft line-through",
};

/** Badge colours and label for a status. An unknown status keeps its raw text and no colour. */
export const orderStatusBadge = (status?: string): { className: string; label: string } => {
  const known = status && status in ORDER_STATUS_BADGE ? (status as OrderStatus) : undefined;
  return {
    className: known ? ORDER_STATUS_BADGE[known] : "",
    label: (known && ORDER_STATUS_LABEL[known]) || status || "",
  };
};
