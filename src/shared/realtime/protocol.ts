/**
 * FE-02 — Protocol v2.2 types.
 *
 * Mirrors `docs/PROTOCOL.md` exactly. This is the single source of truth for
 * every shape that travels over the WebSocket. No optional "alternative"
 * fields (e.g. `title | name`) — if the server doesn't send it, we don't type it.
 */

export const PROTOCOL_VERSION = "2";

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

/** Status moves pending → accepted → preparing → ready → served. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["served"],
  served: [],
  cancelled: [],
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

/** The next allowed staff action for a given status, or null if none. */
export const NEXT_STAFF_ACTION: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending: { next: "accepted", label: "Accept" },
  accepted: { next: "preparing", label: "Start" },
  preparing: { next: "ready", label: "Ready" },
  ready: { next: "served", label: "Served" },
  served: null,
  cancelled: null,
};

export type SessionStatus = "open" | "paying" | "closed";
export type TableStatus = "vacant" | "occupied" | "reserved";
export type Station = "kitchen" | "bar";

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------

export interface OrderItem {
  productId: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  notes: string;
  station: Station;
}

/** One station's part of an order, with its own status. */
export interface Ticket {
  station: Station;
  status: OrderStatus;
  cancelReason: string;
}

export interface Order {
  _id: string;
  restaurantId: string;
  sessionId: string;
  tableId: string;
  clientOrderId: string;
  /** The slowest ticket that is not cancelled. */
  status: OrderStatus;
  rev: number;
  /** One per station the order has items for. */
  tickets: Ticket[];
  items: OrderItem[];
  totalCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  tableId: string;
  tableNumber: number | null;
  status: SessionStatus;
  openedAt: string;
  closedAt: string | null;
  /** Code late guests enter to join this open table. Staff board only. */
  joinCode?: string;
}

/** A table closed in the last 12 hours (`GET /staff/board` → `recentlyClosed`). */
export interface ClosedSession {
  _id: string;
  tableId: string;
  tableNumber: number | null;
  status: "closed";
  openedAt: string;
  closedAt: string;
  totalCents: number;
}

/** GET /api/v1/sessions/:sessionId/bill — open or closed, cancelled orders excluded. */
export interface SessionBill {
  sessionId: string;
  session: Pick<Session, "_id" | "tableId" | "status" | "openedAt" | "closedAt">;
  orders: Order[];
  totalCents: number;
}

export interface BoardTable {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  qrCode: string;
}

/** GET /api/v1/staff/board */
export interface StaffBoard {
  sessions: Session[];
  orders: Order[];
  tables: BoardTable[];
  /** Newest first, at most 50. Their orders are not in `orders`; load the bill. */
  recentlyClosed: ClosedSession[];
}

/** Public/staff menu item shape (REST, `GET /menu-items`, `GET /r/:slug/menu-items`). */
export interface MenuItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceCents: number;
  image: string;
  category: string;
  inStock: boolean;
  station: Station;
  popular: boolean;
  archived?: boolean;
}

/** Payload of the `menu.updated` socket event — a partial projection of MenuItem. */
export interface MenuUpdatedData {
  _id: string;
  title: string;
  priceCents: number;
  inStock: boolean;
  category: string;
  archived: boolean;
}

// ---------------------------------------------------------------------------
// Client -> server messages
// ---------------------------------------------------------------------------

export interface OrderCreateItemInput {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface OrderCreatePayload {
  clientOrderId: string;
  items: OrderCreateItemInput[];
  /** Staff only. Ignored for guests — the server takes tableId/sessionId from the token. */
  tableId?: string;
  sessionId?: string;
}

export interface OrderUpdatePayload {
  orderId: string;
  items: OrderCreateItemInput[];
}

export interface OrderStatusPayload {
  orderId: string;
  status: OrderStatus;
  /** The ticket to move. Without it the server moves the whole order. */
  station?: Station;
}

export interface OrderCancelPayload {
  orderId: string;
  reason?: string;
  /** Staff only: the ticket to cancel. Without it the whole order is cancelled. */
  station?: Station;
}

export type ClientMessageType = "order.create" | "order.update" | "order.status" | "order.cancel";

export type ClientPayloadOf<T extends ClientMessageType> = T extends "order.create"
  ? OrderCreatePayload
  : T extends "order.update"
  ? OrderUpdatePayload
  : T extends "order.status"
  ? OrderStatusPayload
  : T extends "order.cancel"
  ? OrderCancelPayload
  : never;

export interface OutboundMessage<T extends ClientMessageType = ClientMessageType> {
  type: T;
  requestId: string;
  payload: ClientPayloadOf<T>;
}

// ---------------------------------------------------------------------------
// Server -> requester (ack)
// ---------------------------------------------------------------------------

export type ErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "OUT_OF_STOCK"
  | "FORBIDDEN"
  | "INVALID_TRANSITION"
  | "SESSION_CLOSED"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "TIMEOUT";

export interface ValidationDetails {
  fields: Record<string, string>;
}

export interface OutOfStockDetails {
  productIds: string[];
}

export interface InvalidTransitionDetails {
  from: OrderStatus;
  to: OrderStatus;
}

export interface RateLimitedDetails {
  retryAfterMs: number;
}

export type ErrorDetails =
  | ValidationDetails
  | OutOfStockDetails
  | InvalidTransitionDetails
  | RateLimitedDetails
  | Record<string, unknown>
  | undefined;

export class ProtocolError extends Error {
  code: ErrorCode;
  details?: ErrorDetails;

  constructor(code: ErrorCode, message: string, details?: ErrorDetails) {
    super(message);
    this.name = "ProtocolError";
    this.code = code;
    this.details = details;
  }
}

export interface AckOrderData {
  order: Order;
}

export interface AckSuccessMessage<T = AckOrderData> {
  type: "ack";
  requestId: string;
  ok: true;
  data: T;
}

export interface AckFailureMessage {
  type: "ack";
  requestId: string;
  ok: false;
  error: { code: ErrorCode; message: string; details?: ErrorDetails };
}

export type AckMessage<T = AckOrderData> = AckSuccessMessage<T> | AckFailureMessage;

// ---------------------------------------------------------------------------
// Server -> room (events)
// ---------------------------------------------------------------------------

export interface SessionOpenedEvent {
  event: "session.opened";
  data: { session: Session };
}

export interface OrderCreatedEvent {
  event: "order.created";
  data: { order: Order };
}

export interface OrderUpdatedEvent {
  event: "order.updated";
  data: { order: Order };
}

export interface OrderStatusChangedEvent {
  event: "order.statusChanged";
  data: {
    orderId: string;
    status: OrderStatus;
    rev: number;
    tickets: Ticket[];
    totalCents: number;
    /** Present when the change was for one ticket. */
    station?: Station;
    reason?: string;
  };
}

export interface SessionClosedEvent {
  event: "session.closed";
  data: { sessionId: string; tableId: string };
}

export interface MenuUpdatedEvent {
  event: "menu.updated";
  data: MenuUpdatedData;
}

export type ServerEvent =
  | SessionOpenedEvent
  | OrderCreatedEvent
  | OrderUpdatedEvent
  | OrderStatusChangedEvent
  | SessionClosedEvent
  | MenuUpdatedEvent;

export type ServerEventName = ServerEvent["event"];

export type EventData<K extends ServerEventName> = Extract<ServerEvent, { event: K }>["data"];

export interface EventMessage<E extends ServerEvent = ServerEvent> {
  type: "event";
  event: E["event"];
  data: E["data"];
}

export type InboundMessage = AckMessage | EventMessage;

// ---------------------------------------------------------------------------
// Close codes
// ---------------------------------------------------------------------------

export type CloseCode = 4000 | 4001 | 4003 | 4004 | 4008 | 1000 | 1001 | 1006 | 1009;

export type CloseAction =
  | "reload" // 4000 unsupported version — stop, ask for a reload
  | "refreshToken" // 4001 token expired — refresh/re-mint ticket and reconnect
  | "logout" // 4003 forbidden — log out
  | "guestThankYou" // 4004 session closed — guest thank-you, no reconnect
  | "waitThenReconnect" // 4008 abuse — wait, then reconnect
  | "reconnectBackoff" // 1001/1006/1009 — reconnect with backoff
  | "none";

export const CLOSE_CODE_ACTIONS: Record<number, CloseAction> = {
  4000: "reload",
  4001: "refreshToken",
  4003: "logout",
  4004: "guestThankYou",
  4008: "waitThenReconnect",
  1001: "reconnectBackoff",
  1006: "reconnectBackoff",
  1009: "reconnectBackoff",
};

// ---------------------------------------------------------------------------
// Limits (mirrors PROTOCOL.md "Limits" table)
// ---------------------------------------------------------------------------

export const LIMITS = {
  MAX_MESSAGE_BYTES: 16 * 1024,
  RATE_LIMIT_MESSAGES: 10,
  RATE_LIMIT_WINDOW_MS: 10_000,
  MAX_ITEMS_PER_ORDER: 50,
  MAX_QUANTITY_PER_ITEM: 99,
  MAX_NOTES_LENGTH: 200,
} as const;

// ---------------------------------------------------------------------------
// Realtime client status
// ---------------------------------------------------------------------------

export type RealtimeStatus = "connecting" | "open" | "reconnecting" | "closed";
