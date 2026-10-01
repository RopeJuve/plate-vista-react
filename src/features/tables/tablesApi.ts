import api from "../../services/api";
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
