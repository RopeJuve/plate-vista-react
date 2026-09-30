import type { Order, OrderItem, OrderStatusChangedEvent, Station, Ticket } from "./protocol";

const STATIONS: Station[] = ["kitchen", "bar"];

/** What a ticket is called: guests think in drinks and food, staff in stations. */
export const TICKET_LABEL: Record<"guest" | "staff", Record<Station, string>> = {
  guest: { bar: "Drinks", kitchen: "Food" },
  staff: { bar: "Bar", kitchen: "Kitchen" },
};

type Ticketed = Pick<Order, "items" | "status"> & { tickets?: Ticket[]; cancelReason?: string };

/**
 * An order's tickets. An order from before protocol 2.2 (a guest's saved bill,
 * an API that is not updated yet) has none stored: it was one ticket per
 * station, all at the order's status.
 */
export const ticketsOf = (order: Ticketed): Ticket[] =>
  order.tickets?.length
    ? order.tickets
    : STATIONS.filter((station) => order.items.some((item) => item.station === station)).map(
        (station) => ({ station, status: order.status, cancelReason: order.cancelReason ?? "" })
      );

export const ticketLines = (order: Pick<Order, "items">, station: Station): OrderItem[] =>
  order.items.filter((item) => item.station === station);

/**
 * The stations whose lines dropped off the bill: those of a cancelled ticket,
 * when the rest of the order went ahead. A fully cancelled order drops none,
 * so it still lists what was cancelled.
 */
export const droppedStations = (order: Ticketed): Set<Station> => {
  const tickets = ticketsOf(order);
  const cancelled = tickets.filter((ticket) => ticket.status === "cancelled");
  return new Set(cancelled.length < tickets.length ? cancelled.map((ticket) => ticket.station) : []);
};

/** The lines that count towards the bill: all but those of a cancelled ticket. */
export const billedLines = (order: Ticketed): OrderItem[] => {
  const dropped = droppedStations(order);
  return order.items.filter((item) => !dropped.has(item.station));
};

/** No station has started yet, so the order can still be edited or cancelled by the guest. */
export const isUntouched = (order: Ticketed): boolean =>
  ticketsOf(order).every((ticket) => ticket.status === "pending");

export const withStatusChange = <T extends Order>(order: T, data: OrderStatusChangedEvent["data"]): T => ({
  ...order,
  status: data.status,
  rev: data.rev,
  // An API from before 2.2 sends neither; ticketsOf then follows the status.
  tickets: data.tickets,
  totalCents: data.totalCents ?? order.totalCents,
});
