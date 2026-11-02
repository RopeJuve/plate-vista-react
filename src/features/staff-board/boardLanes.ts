import type { OrderStatus } from "../../shared/realtime/protocol";
import type { BoardState } from "./boardState";

export type BoardLane = {
  title: string;
  statuses: OrderStatus[];
  /** Tickets nobody has picked up yet: the count lights up. */
  urgent?: boolean;
  /** Finished tickets: newest first, as one-line chits. */
  compact?: boolean;
};

/** The rail, left to right, in the order a ticket moves along it. */
export const BOARD_LANES: BoardLane[] = [
  { title: "New", statuses: ["pending"], urgent: true },
  { title: "On the line", statuses: ["accepted", "preparing"] },
  { title: "At the pass", statuses: ["ready"] },
  { title: "Served", statuses: ["served"], compact: true },
];

/** Orders still in the house: neither served nor cancelled. */
export const openOrderCount = (state: Pick<BoardState, "ordersById">): number =>
  Object.values(state.ordersById).filter((order) => order.status !== "served" && order.status !== "cancelled").length;
