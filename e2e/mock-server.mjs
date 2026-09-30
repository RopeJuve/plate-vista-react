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
const owners = new Map();
const tables = [];
const sessions = new Map();
const orders = new Map();
const tickets = new Map();
/** refreshToken -> { payload, used } — single use, like the real API. */
const refreshTokens = new Map();
/** guest token -> sessionId, so a device that joined before gets back in. */
const guestTokens = new Map();
let sessionCounter = 0;
const sockets = new Set();

/** Fault injection for the E2E only — see POST /_test/faults. */
const faults = { dropNextOrderCreate: false, failNextBoard: false };

const menu = [
  {
    _id: "item-lager",
    title: "Lager",
    description: "Cold lager",
    priceCents: 450,
    price: 4.5,
    image: "",
    categoryId: "cat-beer",
    category: "beer",
    inStock: true,
    station: "bar",
    popular: false,
    archived: false,
  },
];

// Like the API: each item's category name and station come from its category.
const categories = [{ _id: "cat-beer", name: "beer", station: "bar", position: 1 }];
const initialMenuLength = menu.length;
const withCategory = (item) => {
  const category = categories.find((entry) => entry._id === item.categoryId);
  return { ...item, category: category?.name ?? null, station: category?.station ?? "kitchen" };
};
const menuInOrder = () =>
  menu
    .map(withCategory)
    .sort(
      (a, b) =>
        (categories.find((c) => c._id === a.categoryId)?.position ?? 99) -
          (categories.find((c) => c._id === b.categoryId)?.position ?? 99) ||
        Number(b.popular) - Number(a.popular) ||
        a.title.localeCompare(b.title)
    );


const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

const signToken = (payload) => `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.e2e`;

const JOIN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeJoinCode = () =>
  Array.from({ length: 4 }, () => JOIN_ALPHABET[Math.floor(Math.random() * JOIN_ALPHABET.length)]).join("");

const openSession = (table) => {
  sessionCounter += 1;
  const session = {
    _id: `session-${table._id}-${sessionCounter}`,
    tableId: table._id,
    tableNumber: table.tableNumber,
    status: "open",
    openedAt: new Date().toISOString(),
    closedAt: null,
    joinCode: makeJoinCode(),
  };
  sessions.set(session._id, session);
  table.status = "occupied";
  emit("session.opened", { session });
  return session;
};

const issueTokens = (payload) => {
  const refreshToken = randomUUID();
  refreshTokens.set(refreshToken, { payload, used: false });
  return {
    tokenType: "Bearer",
    accessToken: signToken(payload),
    expiresIn: 3600,
    refreshToken,
  };
};

const sessionTotal = (sessionId) =>
  [...orders.values()]
    .filter((order) => order.sessionId === sessionId && order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalCents, 0);

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
  sessions: [...sessions.values()].filter((session) => session.status === "open"),
  orders: [...orders.values()].filter((order) => sessions.get(order.sessionId)?.status !== "closed"),
  recentlyClosed: [...sessions.values()]
    .filter((session) => session.status === "closed")
    .sort((a, b) => b.closedAt.localeCompare(a.closedAt))
    .map(({ joinCode: _joinCode, ...session }) => ({ ...session, totalCents: sessionTotal(session._id) })),
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

// Like the API: one ticket per station the order has items for, and the order
// is as far along as its slowest ticket.
const STATIONS = ["kitchen", "bar"];
const LIFECYCLE = ["pending", "accepted", "preparing", "ready", "served"];
const ticketsFor = (items) =>
  STATIONS.filter((station) => items.some((item) => item.station === station)).map((station) => ({
    station,
    status: "pending",
    cancelReason: "",
  }));
const slowest = (tickets) =>
  tickets.reduce(
    (status, ticket) => (LIFECYCLE.indexOf(ticket.status) < LIFECYCLE.indexOf(status) ? ticket.status : status),
    "served"
  );

const buildOrder = (payload, identity) => {
  const existing = [...orders.values()].find((order) => order.clientOrderId === payload.clientOrderId);
  if (existing) {
    return existing;
  }
  const session = identity.sessionId ? sessions.get(identity.sessionId) : null;
  const tableId = payload.tableId || session?.tableId || identity.tableId;
  const table = tables.find((item) => item._id === tableId);
  let active =
    session || [...sessions.values()].find((item) => item.tableId === tableId && item.status === "open");
  if (!active && table) {
    active = openSession(table);
  }
  const items = (payload.items || []).map((line) => {
    const found = menu.find((item) => item._id === line.productId);
    const product = found && withCategory(found);
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
      category: product?.category || "Other",
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
    tickets: ticketsFor(items),
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
    // One restaurant at a time: this mock has a single global scope where the
    // real API scopes by restaurantId, so a new registration starts clean and
    // specs sharing the server do not inherit each other's tables and orders.
    employees.clear();
    tables.length = 0;
    sessions.clear();
    orders.clear();
    refreshTokens.clear();
    guestTokens.clear();
    faults.dropNextOrderCreate = false;
    faults.failNextBoard = false;
    menu.length = initialMenuLength;
    categories.length = 1;
    restaurant.id = "rest-1";
    restaurant.slug = String(body.slug || "harbor");
    restaurant.name = String(body.restaurantName || "Restaurant");
    const tokens = issueTokens({
      position: "admin",
      role: "admin",
      employee: body.ownerName,
      slug: restaurant.slug,
      restaurantId: restaurant.id,
    });
    owners.clear();
    owners.set(String(body.email).toLowerCase(), {
      employee: body.employee,
      email: body.email,
      password: body.password,
      position: "owner",
    });
    sendJson(res, 200, {
      message: "Registered",
      ...tokens,
      position: "admin",
      slug: restaurant.slug,
      restaurantId: restaurant.id,
    });
    return;
  }

  if (req.method === "POST" && route === "/employee") {
    // Like the API: names are unique per restaurant, ignoring case.
    if (employees.has(String(body.employee).toLowerCase())) {
      sendJson(res, 409, { code: "VALIDATION", message: "An employee with this name already exists" });
      return;
    }
    employees.set(String(body.employee).toLowerCase(), {
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

  if (req.method === "POST" && (route === "/auth/employee/login" || route === "/auth/owner/login")) {
    const person =
      route === "/auth/owner/login"
        ? owners.get(String(body.email).toLowerCase())
        : body.restaurant === restaurant.slug
          ? employees.get(String(body.employee).toLowerCase())
          : undefined;
    if (!person || person.password !== body.password) {
      sendJson(res, 401, { code: "UNAUTHORIZED", message: "Invalid credentials" });
      return;
    }
    const tokens = issueTokens({
      position: person.position,
      role: person.position,
      employee: person.employee,
      slug: restaurant.slug,
      restaurantId: restaurant.id,
    });
    sendJson(
      res,
      200,
      {
        message: "Logged in successfully",
        ...tokens,
        position: person.position,
        restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
      },
      { Authorization: `Bearer ${tokens.accessToken}` }
    );
    return;
  }

  if (req.method === "POST" && route === "/auth/refresh") {
    if (!body.refreshToken) {
      sendJson(res, 400, { code: "VALIDATION", message: "refreshToken is required" });
      return;
    }
    const entry = refreshTokens.get(String(body.refreshToken));
    if (!entry || entry.used) {
      sendJson(res, 401, { code: "UNAUTHORIZED", message: "Unauthorized" });
      return;
    }
    entry.used = true;
    sendJson(res, 200, { message: "Refreshed", ...issueTokens(entry.payload) });
    return;
  }

  if (req.method === "POST" && route === "/auth/logout") {
    refreshTokens.delete(String(body.refreshToken));
    res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
    res.end();
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
    let opened = false;
    if (!session) {
      session = openSession(table);
      opened = true;
    } else {
      const rejoin = body.guestToken && guestTokens.get(String(body.guestToken)) === session._id;
      const code = typeof body.joinCode === "string" ? body.joinCode.toUpperCase() : "";
      if (!rejoin && !code) {
        sendJson(res, 403, { code: "JOIN_CODE_REQUIRED", message: "Join code required" });
        return;
      }
      if (!rejoin && code !== session.joinCode) {
        sendJson(res, 403, { code: "JOIN_CODE_INVALID", message: "Wrong join code" });
        return;
      }
    }
    const token = signToken({
      sessionId: session._id,
      tableId: table._id,
      tableNumber: table.tableNumber,
      slug: restaurant.slug,
      nonce: randomUUID(),
    });
    guestTokens.set(token, session._id);
    sendJson(res, 200, {
      token,
      sessionId: session._id,
      joinCode: session.joinCode,
      opened,
      table: { _id: table._id, tableNumber: table.tableNumber },
    });
    return;
  }

  if (req.method === "GET" && /^\/sessions\/[^/]+\/bill$/.test(route)) {
    const sessionId = route.split("/")[2];
    const session = sessions.get(sessionId);
    const payload = readToken(req);
    if (!session || !payload || (payload.sessionId && payload.sessionId !== sessionId)) {
      sendJson(res, 404, { message: "Session not found" });
      return;
    }
    sendJson(res, 200, {
      sessionId,
      session: {
        _id: session._id,
        tableId: session.tableId,
        status: session.status,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
      },
      orders: [...orders.values()].filter(
        (order) => order.sessionId === sessionId && order.status !== "cancelled"
      ),
      totalCents: sessionTotal(sessionId),
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
    sendJson(res, 200, menuInOrder());
    return;
  }

  if (req.method === "GET" && (route === "/menu-items/category" || /^\/r\/[^/]+\/menu-items\/category$/.test(route))) {
    sendJson(res, 200, [...new Set(menuInOrder().map((item) => item.category))]);
    return;
  }

  // Uploads need Cloudinary, which the mock does not have.
  if (req.method === "POST" && route === "/menu-items/upload-signature") {
    sendJson(res, 503, { code: "INTERNAL", message: "Image uploads are not configured" });
    return;
  }

  if (req.method === "POST" && route === "/menu-items") {
    const item = {
      _id: `item-${randomUUID()}`,
      title: String(body.title),
      description: body.description || "",
      priceCents: Math.round(Number(body.price) * 100),
      price: Number(body.price),
      image: body.image || null,
      categoryId: body.categoryId,
      inStock: body.inStock !== false,
      popular: Boolean(body.popular),
      archived: false,
    };
    menu.push(item);
    sendJson(res, 201, withCategory(item));
    return;
  }

  const menuItemMatch = route.match(/^\/menu-items\/([^/]+)$/);
  if (req.method === "PUT" && menuItemMatch) {
    const item = menu.find((entry) => entry._id === menuItemMatch[1]);
    if (!item) {
      sendJson(res, 404, { message: "Not found" });
      return;
    }
    Object.assign(item, body, body.price ? { priceCents: Math.round(Number(body.price) * 100) } : {});
    sendJson(res, 200, withCategory(item));
    return;
  }

  if (req.method === "GET" && route === "/categories") {
    sendJson(res, 200, [...categories].sort((a, b) => a.position - b.position));
    return;
  }

  if (req.method === "POST" && route === "/categories") {
    const name = String(body.name || "").trim();
    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      sendJson(res, 409, { code: "VALIDATION", message: "A category with this name already exists" });
      return;
    }
    const category = {
      _id: `cat-${randomUUID()}`,
      name,
      station: body.station === "bar" ? "bar" : "kitchen",
      position: Math.max(0, ...categories.map((entry) => entry.position)) + 1,
    };
    categories.push(category);
    sendJson(res, 201, category);
    return;
  }

  const categoryMatch = route.match(/^\/categories\/([^/]+)(\/move)?$/);
  if (categoryMatch) {
    const category = categories.find((entry) => entry._id === categoryMatch[1]);
    if (!category) {
      sendJson(res, 404, { message: "Not found" });
      return;
    }
    if (req.method === "PUT") {
      Object.assign(category, body.name ? { name: String(body.name).trim() } : {}, body.station ? { station: body.station } : {});
      sendJson(res, 200, category);
      return;
    }
    if (req.method === "POST" && categoryMatch[2]) {
      const ordered = [...categories].sort((a, b) => a.position - b.position);
      const index = ordered.indexOf(category);
      const other = ordered[body.direction === "up" ? index - 1 : index + 1];
      if (other) [category.position, other.position] = [other.position, category.position];
      sendJson(res, 200, [...categories].sort((a, b) => a.position - b.position));
      return;
    }
    if (req.method === "DELETE") {
      const used = menu.filter((item) => item.categoryId === category._id && !item.archived).length;
      if (used > 0) {
        sendJson(res, 409, { code: "VALIDATION", message: `Move its ${used} ${used === 1 ? "item" : "items"} to another category first` });
        return;
      }
      categories.splice(categories.indexOf(category), 1);
      res.writeHead(204, { "Access-Control-Allow-Origin": "*" }).end();
      return;
    }
  }

  if (req.method === "GET" && route === "/staff/board") {
    if (faults.failNextBoard) {
      // One cold-start style failure, as the real API can do on wake-up.
      faults.failNextBoard = false;
      sendJson(res, 503, { message: "Board unavailable" });
      return;
    }
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

  if (req.method === "POST" && route === "/_test/faults") {
    faults.dropNextOrderCreate = Boolean(body.dropNextOrderCreate);
    faults.failNextBoard = Boolean(body.failNextBoard);
    sendJson(res, 200, { ...faults });
    return;
  }

  if (req.method === "GET" && route === "/orders") {
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(url.searchParams.get("limit")) || 20);
    const all = [...orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * limit;
    sendJson(res, 200, { orders: all.slice(start, start + limit), total: all.length });
    return;
  }

  // Statistics over every non-cancelled order; the mock ignores date ranges.
  if (req.method === "GET" && route.startsWith("/statistics/")) {
    const sold = [...orders.values()].filter((order) => order.status !== "cancelled");
    const monthly = url.searchParams.get("group_by") === "month";
    const dateOf = (order) => order.createdAt.slice(0, monthly ? 7 : 10);
    const lines = sold.flatMap((order) => order.items.map((item) => ({ ...item, date: dateOf(order) })));
    const sum = (rows, pick) => rows.reduce((total, row) => total + pick(row), 0);
    const groupBy = (rows, keyOf) => {
      const groups = new Map();
      rows.forEach((row) => groups.set(keyOf(row), [...(groups.get(keyOf(row)) || []), row]));
      return [...groups.entries()];
    };
    const dishes = groupBy(lines, (line) => line.title)
      .map(([title, rows]) => ({
        menu_item: title,
        numSold: sum(rows, (row) => row.quantity),
        totalCents: sum(rows, (row) => row.lineTotalCents),
      }))
      .sort((a, b) => b.numSold - a.numSold);
    const totalCents = sum(sold, (order) => order.totalCents);
    const answers = {
      "/statistics/sales": { totalCents },
      "/statistics/summary": {
        ordersCount: sold.length,
        totalCents,
        averageOrderCents: sold.length ? Math.round(totalCents / sold.length) : 0,
        itemsSold: sum(lines, (line) => line.quantity),
        topItem: dishes[0] || null,
      },
      "/statistics/sales/menu-items": dishes.slice(0, Number(url.searchParams.get("limit")) || 100),
      "/statistics/orders/by-date": groupBy(sold, dateOf).map(([date, rows]) => ({
        date,
        ordersCount: rows.length,
        totalCents: sum(rows, (row) => row.totalCents),
      })),
      "/statistics/sales/categories": groupBy(lines, (line) => `${line.date}|${line.category}`).map(
        ([key, rows]) => ({
          date: key.split("|")[0],
          category: key.split("|")[1],
          numSold: sum(rows, (row) => row.quantity),
          totalCents: sum(rows, (row) => row.lineTotalCents),
        })
      ),
    };
    if (route in answers) {
      sendJson(res, 200, answers[route]);
      return;
    }
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
        if (faults.dropNextOrderCreate) {
          // Drop the connection before the order is built, so the client's
          // in-flight request fails and it must retry after reconnecting.
          faults.dropNextOrderCreate = false;
          ws.terminate();
          return;
        }
        const closed = identity.sessionId && sessions.get(identity.sessionId)?.status === "closed";
        if (closed) {
          ws.send(
            JSON.stringify({
              type: "ack",
              requestId: message.requestId,
              ok: false,
              error: { code: "SESSION_CLOSED", message: "Session is closed" },
            })
          );
          return;
        }
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
        const { station, status } = message.payload;
        order.tickets
          .filter((ticket) => (station ? ticket.station === station : ticket.status === order.status))
          .forEach((ticket) => {
            ticket.status = status;
          });
        order.status = slowest(order.tickets);
        order.rev += 1;
        order.updatedAt = new Date().toISOString();
        ws.send(JSON.stringify({ type: "ack", requestId: message.requestId, ok: true, data: { order } }));
        emit("order.statusChanged", {
          orderId: order._id,
          status: order.status,
          rev: order.rev,
          tickets: order.tickets,
          totalCents: order.totalCents,
          ...(station ? { station } : {}),
        });
        return;
      }
      if (message.type === "order.update" || message.type === "order.cancel") {
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
        order.rev += 1;
        order.updatedAt = new Date().toISOString();
        if (message.type === "order.update") {
          const quantities = new Map((message.payload.items || []).map((line) => [line.productId, line.quantity]));
          order.items.forEach((item) => {
            item.quantity = Number(quantities.get(item.productId)) || item.quantity;
            item.lineTotalCents = item.unitPriceCents * item.quantity;
          });
          order.totalCents = order.items.reduce((sum, item) => sum + item.lineTotalCents, 0);
          ws.send(JSON.stringify({ type: "ack", requestId: message.requestId, ok: true, data: { order } }));
          emit("order.updated", { order });
          return;
        }
        // Without a station the whole order is cancelled.
        const reason = message.payload.reason || "";
        order.tickets.forEach((ticket) => {
          ticket.status = "cancelled";
          ticket.cancelReason = reason;
        });
        order.status = "cancelled";
        ws.send(JSON.stringify({ type: "ack", requestId: message.requestId, ok: true, data: { order } }));
        emit("order.statusChanged", {
          orderId: order._id,
          status: order.status,
          rev: order.rev,
          tickets: order.tickets,
          totalCents: order.totalCents,
          reason,
        });
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
