import { decodeJwt } from "../../shared/api/jwt";
import type { GuestSession } from "./types";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const parseGuestAuth = (data: unknown, slug: string, qrCode: string): GuestSession => {
  const body = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const token = asString(body.token || body.accessToken);
  const payload = token ? decodeJwt(token) : {};
  const session =
    body.session && typeof body.session === "object" ? (body.session as Record<string, unknown>) : {};
  const sessionId = asString(session._id || body.sessionId || payload.sessionId);
  const tableId = asString(session.tableId || body.tableId || payload.tableId);
  const tableNumber = asNumber(session.tableNumber ?? body.tableNumber ?? payload.tableNumber);
  if (!token) {
    throw new Error("The table login did not return a token");
  }
  return { token, sessionId, tableId, tableNumber, slug, qrCode };
};

export const clearGuestStorage = (sessionId?: string) => {
  if (sessionId) {
    localStorage.removeItem(`cart:${sessionId}`);
    localStorage.removeItem(`bill:${sessionId}`);
    localStorage.removeItem(`pending-order:guest:${sessionId}`);
  }
  localStorage.removeItem("cart");
};
