import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";

/**
 * Mints a one-shot WebSocket ticket. Called before every connect and reconnect.
 * A ticket expires after 60 seconds and must never be reused.
 */
export const fetchWsTicket = async (accessToken: string): Promise<string> => {
  const base = String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");
  const { data } = await axios.post(
    `${base}/ws-ticket`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const ticket = data?.ticket;
  if (typeof ticket !== "string" || !ticket) {
    throw new Error("WebSocket ticket was not returned");
  }
  return ticket;
};
