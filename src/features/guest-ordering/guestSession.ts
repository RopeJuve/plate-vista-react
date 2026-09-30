import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
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
  const table = body.table && typeof body.table === "object" ? (body.table as Record<string, unknown>) : {};
  const sessionId = asString(session._id || body.sessionId || payload.sessionId);
  const tableId = asString(session.tableId || table._id || body.tableId || payload.tableId);
  const tableNumber = asNumber(
    session.tableNumber ?? table.tableNumber ?? body.tableNumber ?? payload.tableNumber
  );
  if (!token) {
    throw new Error("The table login did not return a token");
  }
  return {
    token,
    sessionId,
    tableId,
    tableNumber,
    slug,
    qrCode,
    joinCode: asString(body.joinCode || session.joinCode).toUpperCase(),
    opened: body.opened === true,
  };
};

/** Join codes use A–Z without I and O, and 2–9. Case does not matter. */
export const normalizeJoinCode = (value: string) =>
  value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 4);

const guestTokenKey = (qrCode: string) => `guestToken:${qrCode}`;

export type JoinTableResult =
  | { status: "joined"; session: GuestSession }
  | { status: "needsCode" }
  | { status: "wrongCode" }
  | { status: "tooManyTries" }
  | { status: "notFound" }
  | { status: "error"; message: string };

const joinsInFlight = new Map<string, Promise<JoinTableResult>>();

/**
 * `POST /auth/table/:qrCode`. The first guest opens the table and gets its join
 * code; everyone after needs that code. A device that joined before sends its
 * old guest token instead, so a reload or rescan gets straight back in.
 *
 * Uses a bare axios call: the shared client would toast "Not allowed" on the
 * expected 403s, and must not attach a staff token.
 *
 * Two scans of a free table at once (a double effect, a double tap) would
 * both try to open it and the second would be asked for a code, so identical
 * requests in flight share one call.
 */
export const joinTable = (slug: string, qrCode: string, joinCode?: string): Promise<JoinTableResult> => {
  const key = `${slug}/${qrCode}/${joinCode ? normalizeJoinCode(joinCode) : ""}`;
  const existing = joinsInFlight.get(key);
  if (existing) {
    return existing;
  }
  const request = requestJoin(slug, qrCode, joinCode).finally(() => {
    joinsInFlight.delete(key);
  });
  joinsInFlight.set(key, request);
  return request;
};

const requestJoin = async (slug: string, qrCode: string, joinCode?: string): Promise<JoinTableResult> => {
  const base = String(plateVistaConfig.VITE_VERCEL_API_URL || "").replace(/\/$/, "");
  const guestToken = localStorage.getItem(guestTokenKey(qrCode)) || undefined;
  try {
    const { data } = await axios.post(`${base}/auth/table/${encodeURIComponent(qrCode)}`, {
      joinCode: joinCode ? normalizeJoinCode(joinCode) : undefined,
      guestToken,
    });
    const session = parseGuestAuth(data, slug, qrCode);
    localStorage.setItem(guestTokenKey(qrCode), session.token);
    return { status: "joined", session };
  } catch (error) {
    const response = (error as { response?: { status?: number; data?: { code?: string; message?: string } } })
      .response;
    const code = response?.data?.code;
    if (code === "JOIN_CODE_REQUIRED") {
      return { status: "needsCode" };
    }
    if (code === "JOIN_CODE_INVALID") {
      return { status: "wrongCode" };
    }
    if (response?.status === 429) {
      return { status: "tooManyTries" };
    }
    if (response?.status === 404) {
      return { status: "notFound" };
    }
    return {
      status: "error",
      message: response?.data?.message || (error instanceof Error ? error.message : "Could not join the table"),
    };
  }
};

export const clearGuestStorage = (sessionId?: string, qrCode?: string) => {
  if (sessionId) {
    localStorage.removeItem(`cart:${sessionId}`);
    localStorage.removeItem(`bill:${sessionId}`);
    localStorage.removeItem(`pending-order:guest:${sessionId}`);
  }
  if (qrCode) {
    localStorage.removeItem(guestTokenKey(qrCode));
  }
  localStorage.removeItem("cart");
};
