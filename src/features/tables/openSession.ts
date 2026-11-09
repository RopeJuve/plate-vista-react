import type { StaffBoard } from "../../shared/realtime/protocol";

/** The session (bill) still running at a table, open or being paid,, from a `GET /staff/board` snapshot. */
export const openSessionIdFor = (board: Partial<StaffBoard> | null | undefined, tableId: string): string | null =>
  (Array.isArray(board?.sessions) ? board.sessions : []).find(
    (session) => session.tableId === tableId && session.status !== "closed"
  )?._id ?? null;
