import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
import type { SessionBill } from "../realtime/protocol";
import api from "./client";

/**
 * `GET /sessions/:sessionId/bill`. Works for open and closed tables.
 * Staff calls go through the shared client; a guest passes their table token,
 * which only reads its own session.
 */
export const fetchBill = async (sessionId: string, guestToken?: string): Promise<SessionBill> => {
  const path = `/sessions/${encodeURIComponent(sessionId)}/bill`;
  if (!guestToken) {
    const { data } = await api.get<SessionBill>(path);
    return data;
  }
  const base = String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");
  const { data } = await axios.get<SessionBill>(`${base}${path}`, {
    headers: { Authorization: `Bearer ${guestToken}` },
  });
  return data;
};
