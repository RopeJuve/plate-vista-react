import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
import api from "./client";

const readTicket = (data: unknown) => {
  const ticket = (data as { ticket?: unknown } | null)?.ticket;
  if (typeof ticket !== "string" || !ticket) {
    throw new Error("WebSocket ticket was not returned");
  }
  return ticket;
};

/**
 * Mints a one-shot WebSocket ticket (`POST /ws-ticket`). Called before every
 * connect and reconnect. A ticket expires after 60 seconds and works once.
 *
 * Without a token this is a staff call through the shared client, which
 * refreshes an expired access token on 401. Guests pass their table token.
 */
export const fetchWsTicket = async (guestToken?: string): Promise<string> => {
  if (!guestToken) {
    const { data } = await api.post("/ws-ticket", {});
    return readTicket(data);
  }
  const base = String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");
  const { data } = await axios.post(
    `${base}/ws-ticket`,
    {},
    { headers: { Authorization: `Bearer ${guestToken}` } }
  );
  return readTicket(data);
};
