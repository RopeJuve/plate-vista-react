import type { Table } from "../../types";

/** How often the admin's table list re-reads `GET /table`: it has no socket to hear staff seat or close tables. */
export const TABLES_REFRESH_MS = 15_000;

/** What a printed QR card needs: the table, and the code its link carries. */
export type QrTable = {
  _id: string;
  tableNumber: number;
  qrCode: string;
};

/** `GET /table` answers with a bare list or `{ tables }`. */
export const toTableList = (data: unknown): Table[] => {
  if (Array.isArray(data)) {
    return data as Table[];
  }
  const tables = (data as { tables?: unknown } | null)?.tables;
  return Array.isArray(tables) ? (tables as Table[]) : [];
};

/** Tables in floor order: 1, 2, … 10, not 1, 10, 2. */
export const byTableNumber = (tables: Table[]): Table[] =>
  [...tables].sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber));

/** Table numbers keyed by id, for orders that carry only a `tableId`. */
export const tableNumbersById = (tables: Table[]): Record<string, number> => {
  const byId: Record<string, number> = {};
  tables.forEach((table) => {
    if (table?._id && Number.isFinite(Number(table.tableNumber))) {
      byId[String(table._id)] = Number(table.tableNumber);
    }
  });
  return byId;
};

/** Tables that can have a QR card printed: only those the server gave a code. */
export const toQrTables = (tables: Table[]): QrTable[] =>
  tables
    .filter((table): table is Table & { _id: string; qrCode: string } =>
      Boolean(table?._id && (table as { qrCode?: string }).qrCode)
    )
    .map((table) => ({
      _id: String(table._id),
      tableNumber: Number(table.tableNumber),
      qrCode: String(table.qrCode),
    }));

export const openOrderCount = (table: Table): number => (Array.isArray(table?.orders) ? table.orders.length : 0);

/** A new table needs a whole number of at least one, and seats for at least one. Null when it does not. */
export const parseNewTable = (tableNumber: string, capacity: string) => {
  const number = Number(tableNumber);
  const seats = Number(capacity);
  if (!Number.isInteger(number) || number < 1 || !Number.isInteger(seats) || seats < 1) {
    return null;
  }
  return { tableNumber: number, capacity: seats };
};
