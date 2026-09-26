/**
 * Local protocol stand-in for the ordering E2E.
 * Speaks the REST routes the app already calls and WebSocket v2.1 acks/events.
 */
import http from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = 5099;
const restaurant = {
  id: "",
  slug: "",
  name: "",
};
const employees = new Map();
const tables = [];
const sessions = new Map();
const orders = new Map();
const tickets = new Map();
const sockets = new Set();

const menu = [
  {
    _id: "item-lager",
    title: "Lager",
    description: "Cold lager",
    priceCents: 450,
    price: 4.5,
    image: "",
    category: "beer",
    inStock: true,
    station: "bar",
    popular: false,
    archived: false,
  },
];

const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

const signToken = (payload) => `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.e2e`;

const readToken = (req) => {
  const header = req.headers.authorization || "";
  const raw = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!raw) {
    return null;
  }
  const part = raw.split(".")[1];
  if (!part) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};

const sendJson = (res, status, body, extraHeaders = {}) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, x-restaurant-id",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Expose-Headers": "Authorization",
    ...extraHeaders,
  });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });

const board = () => ({
  sessions: [...sessions.values()],
  orders: [...orders.values()],
  tables: tables.map((table) => ({
    _id: table._id,
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    status: table.status,
    qrCode: table.qrCode,
  })),
});

const broadcast = (message, filter) => {
  const raw = JSON.stringify(message);
  sockets.forEach((client) => {
    if (client.readyState !== 1) {
      return;
    }
    if (filter && !filter(client)) {
      return;
    }
    client.send(raw);
  });
};

const emit = (event, data) => broadcast({ type: "event", event, data });

const buildOrder = (payload, identity) => {
  const existing = [...orders.values()].find((order) => order.clientOrderId === payload.clientOrderId);
  if (existing) {
    return existing;
  }
  const session = identity.sessionId ? sessions.get(identity.sessionId) : null;
  const tableId = payload.tableId || session?.tableId || identity.tableId;
  const table = tables.find((item) => item._id === tableId);
  let active = session;
  if (!active && table) {
    active = {
      _id: `session-${table._id}`,
      tableId: table._id,
      tableNumber: table.tableNumber,
      status: "open",
      openedAt: new Date().toISOString(),
      closedAt: null,
    };
    sessions.set(active._id, active);
    table.status = "occupied";
    emit("session.opened", { session: active });
  }
  const items = (payload.items || []).map((line) => {
    const product = menu.find((item) => item._id === line.productId);
    const quantity = Number(line.quantity) || 0;
    const unitPriceCents = product?.priceCents ?? 0;
    return {
      productId: line.productId,
      title: product?.title || "Item",
      unitPriceCents,
      quantity,
      lineTotalCents: unitPriceCents * quantity,
      notes: typeof line.notes === "string" ? line.notes : "",
      station: product?.station || "kitchen",
    };
  });
  const now = new Date().toISOString();
  const order = {
    _id: `order-${randomUUID()}`,
    restaurantId: restaurant.id,
    sessionId: active?._id || identity.sessionId || "",
    tableId: tableId || "",
    clientOrderId: payload.clientOrderId,
    status: "pending",
    rev: 1,
    items,
    totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    createdAt: now,
    updatedAt: now,
  };
  orders.set(order._id, order);
  emit("order.created", { order });
  return order;
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }
  if (path === "/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const route = path.replace(/^\/api\/v1/, "") || "/";
  const body = ["POST", "PUT", "PATCH"].includes(req.method || "") ? await readBody(req) : {};

  if (req.method === "POST" && route === "/auth/register") {
    restaurant.id = "rest-1";
    restaurant.slug = String(body.slug || "harbor");
    restaurant.name = String(body.restaurantName || "Restaurant");
    const token = signToken({
      position: "admin",
      role: "admin",
      employee: body.ownerName,
      slug: restaurant.slug,
      restaurantId: restaurant.id,
    });
    employees.set(String(body.email), {
      employee: body.ownerName,
      email: body.email,
      password: body.password,
      position: "admin",
    });
    sendJson(res, 200, {
      token,
      slug: restaurant.slug,
      restaurantId: restaurant.id,
    });
    return;
  }

  if (req.method === "POST" && route === "/employee") {
    employees.set(String(body.employee), {
      employee: body.employee,
      email: body.email,
      password: body.password,
      position: body.position,
    });
    sendJson(res, 201, { ok: true });
    return;
  }

  if (req.method === "GET" && route === "/employee") {
    sendJson(
      res,
      200,
      [...employees.values()].map((person, index) => ({
        _id: `emp-${index}`,
        employee: person.employee,
        email: person.email,
        position: person.position,
      }))
    );
    return;
  }

  if (req.method === "POST" && route === "/auth/employee/login") {
    const person = employees.get(String(body.employee));
    if (!person || person.password !== body.password) {
      sendJson(res, 401, { message: "Login failed" });
      return;
    }
    const token = signToken({
      position: person.position,
      role: person.position,
      employee: person.employee,
      slug: restaurant.slug,
      restaurantId: restaurant.id,
    });
    sendJson(res, 200, { token, position: person.position }, { Authorization: `Bearer ${token}` });
    return;
  }

  if (req.method === "GET" && route === "/auth/user") {
    const payload = readToken(req);
    if (!payload) {
      sendJson(res, 401, { message: "Unauthorized" });
      return;
    }
    sendJson(res, 200, {
      user: { position: payload.position, role: payload.role, employee: payload.employee },
      restaurant: { slug: payload.slug || restaurant.slug },
      slug: payload.slug || restaurant.slug,
    });
    return;
  }

  if (req.method === "POST" && route.startsWith("/auth/table/")) {
    const qrCode = decodeURIComponent(route.slice("/auth/table/".length));
    const table = tables.find((item) => item.qrCode === qrCode);
    if (!table) {
      sendJson(res, 404, { message: "Table not found" });
      return;
    }
    let session = [...sessions.values()].find((item) => item.tableId === table._id && item.status === "open");
    if (!session) {
      session = {
        _id: `session-${table._id}`,
        tableId: table._id,
        tableNumber: table.tableNumber,
        status: "open",
        openedAt: new Date().toISOString(),
        closedAt: null,
      };
      sessions.set(session._id, session);
      table.status = "occupied";
    }
    const token = signToken({
      sessionId: session._id,
      tableId: table._id,
      tableNumber: table.tableNumber,
      slug: restaurant.slug,
    });
    sendJson(res, 200, {
      token,
      sessionId: session._id,
      tableId: table._id,
      tableNumber: table.tableNumber,
      session,
    });
    return;
  }

  if (req.method === "POST" && route === "/ws-ticket") {
    const payload = readToken(req);
    if (!payload) {
      sendJson(res, 401, { message: "Unauthorized" });
      return;
    }
    const ticket = randomUUID();
    tickets.set(ticket, payload);
    sendJson(res, 200, { ticket });
    return;
  }

  if (req.method === "GET" && route === "/table") {
    sendJson(res, 200, tables);
    return;
  }

  if (req.method === "POST" && route === "/table") {
    const tableNumber = Number(body.tableNumber);
    const capacity = Number(body.capacity);
    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      sendJson(res, 400, { message: "Enter a table number" });
      return;
    }
    if (tables.some((table) => table.tableNumber === tableNumber)) {
      sendJson(res, 409, { message: "That table number already exists" });
      return;
    }
    const table = {
      _id: `table-${tableNumber}`,
      tableNumber,
      capacity: Number.isInteger(capacity) ? capacity : 4,
      status: "vacant",
      qrCode: `qr-${tableNumber}`,
      customers: 0,
      orders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tables.push(table);
    sendJson(res, 201, { table });
    return;
  }

  if (req.method === "GET" && (route === "/menu-items" || /^\/r\/[^/]+\/menu-items$/.test(route))) {
    sendJson(res, 200, menu);
    return;
  }

  if (req.method === "GET" && route === "/menu-items/category") {
    sendJson(res, 200, ["beer"]);
    return;
  }

  if (req.method === "GET" && route === "/staff/board") {
    sendJson(res, 200, board());
    return;
  }

  if (req.method === "POST" && /^\/sessions\/[^/]+\/close$/.test(route)) {
    const sessionId = route.split("/")[2];
    const session = sessions.get(sessionId);
    if (!session) {
      sendJson(res, 404, { message: "Session not found" });
      return;
    }
    session.status = "closed";
    session.closedAt = new Date().toISOString();
    const table = tables.find((item) => item._id === session.tableId);
    if (table) {
      table.status = "vacant";
    }
    emit("session.closed", { sessionId, tableId: session.tableId });
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && route === "/orders") {
    sendJson(res, 200, { orders: [], total: 0 });
    return;
  }

  if (req.method === "GET" && route === "/statistics/sales") {
    sendJson(res, 200, { totalCents: 0 });
    return;
  }

  if (req.method === "GET" && route === "/statistics/orders/by-date") {
    sendJson(res, 200, []);
    return;
  }

  sendJson(res, 404, { message: `No mock route for ${req.method} ${route}` });
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }
  const ticket = url.searchParams.get("ticket");
  const version = url.searchParams.get("v");
  if (version !== "2" || !ticket || !tickets.has(ticket)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  const identity = tickets.get(ticket);
  tickets.delete(ticket);
  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.identity = identity;
    sockets.add(ws);
    ws.on("message", (raw) => {
      let message;
      try {
        message = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (message.type === "order.create") {
        const order = buildOrder(message.payload || {}, identity);
        ws.send(JSON.stringify({ type: "ack", requestId: message.requestId, ok: true, data: { order } }));
        return;
      }
      if (message.type === "order.status") {
        const order = orders.get(message.payload?.orderId);
        if (!order) {
          ws.send(
            JSON.stringify({
              type: "ack",
              requestId: message.requestId,
              ok: false,
              error: { code: "NOT_FOUND", message: "Order not found" },
            })
          );
          return;
        }
        order.status = message.payload.status;
        order.rev += 1;
        order.updatedAt = new Date().toISOString();
        ws.send(JSON.stringify({ type: "ack", requestId: message.requestId, ok: true, data: { order } }));
        emit("order.statusChanged", { orderId: order._id, status: order.status, rev: order.rev });
        return;
      }
      ws.send(
        JSON.stringify({
          type: "ack",
          requestId: message.requestId,
          ok: false,
          error: { code: "INTERNAL", message: "Unsupported request" },
        })
      );
    });
    ws.on("close", () => sockets.delete(ws));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock api listening on ${PORT}`);
});
