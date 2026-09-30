import type { Order } from "../../shared/realtime/protocol";
import { TICKET_LABEL, ticketsOf } from "../../shared/realtime/tickets";
import StepRow from "./StepRow";
import { cn } from "@/lib/utils";

/**
 * An order's progress: one StepRow per ticket, drinks first, so the guest sees
 * the drinks are on their way while the food is still cooking. An order for a
 * single station shows one unlabelled row, as before tickets.
 */
const TicketSteps = ({
  order,
  audience,
  className,
}: {
  order: Pick<Order, "items" | "status"> & Partial<Pick<Order, "tickets">>;
  audience: "guest" | "staff";
  className?: string;
}) => {
  const tickets = ticketsOf(order);
  if (tickets.length < 2) {
    return <StepRow status={tickets[0]?.status ?? order.status} className={className} />;
  }
  const drinksFirst = [...tickets].sort((a, b) => Number(b.station === "bar") - Number(a.station === "bar"));
  return (
    <ul className={cn("space-y-1.5", className)}>
      {drinksFirst.map((ticket) => (
        <li key={ticket.station} className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
            {TICKET_LABEL[audience][ticket.station]}
          </span>
          <StepRow status={ticket.status} className="flex-1" />
        </li>
      ))}
    </ul>
  );
};

export default TicketSteps;
