import api from "../../services/api";
import type { StaffBoard } from "../../shared/realtime/protocol";
import { openSessionIdFor } from "./openSession";
import { toTableList } from "./tableList";

export const fetchTableList = async () => toTableList((await api.get("/table")).data);

export const createTable = async (body: { tableNumber: number; capacity: number }) => {
  await api.post("/table", body);
};

/** Issues the table a new QR code, so a lost card stops working. Resolves to the new code, or null if none came back. */
export const regenerateQrCode = async (tableId: string): Promise<string | null> => {
  const { data } = await api.post(`/table/${tableId}/regenerate`);
  const qrCode = data?.qrCode || data?.table?.qrCode;
  return typeof qrCode === "string" ? qrCode : null;
};

/** The id of the open session at a table, or null when nobody is seated there. */
export const fetchOpenSessionId = async (tableId: string) =>
  openSessionIdFor((await api.get<StaffBoard>("/staff/board")).data, tableId);
