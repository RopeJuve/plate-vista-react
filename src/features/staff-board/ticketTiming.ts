import type { OrderStatus } from "../../shared/realtime/protocol";

/** Minutes a ticket may sit in a status before it wears the hazard hatch. Served and cancelled tickets never do. */
export const OVERDUE_AFTER_MINUTES: Partial<Record<OrderStatus, number>> = {
  pending: 5,
  accepted: 15,
  preparing: 15,
  ready: 5,
};

/** Minutes a seated table's oldest open order may wait before its timer turns red on the floor. */
export const TABLE_LATE_AFTER_MINUTES = 15;

/** Past the limit, or never when there is none. */
export const isOverdue = (minutesWaiting: number, limit?: number): boolean =>
  limit !== undefined && minutesWaiting >= limit;
