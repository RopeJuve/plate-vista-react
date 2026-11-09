import type { StaffBoard } from "../../shared/realtime/protocol";
import { SESSION_ID, unpaidBill } from "./bill";

export const TABLE_ID = unpaidBill.session.tableId;

/** `GET /staff/board`: table 4 is open with the unpaid bill's order, table 5 is free. */
export const staffBoard: StaffBoard = {
  sessions: [
    {
      _id: SESSION_ID,
      tableId: TABLE_ID,
      tableNumber: 4,
      status: "open",
      openedAt: unpaidBill.session.openedAt,
      closedAt: null,
      joinCode: "4821",
    },
  ],
  orders: unpaidBill.orders,
  tables: [
    { _id: TABLE_ID, tableNumber: 4, capacity: 4, status: "occupied", qrCode: "qr-table-4" },
    { _id: "table-5", tableNumber: 5, capacity: 2, status: "vacant", qrCode: "qr-table-5" },
  ],
  recentlyClosed: [],
};
