import { payableCents } from "../../features/guest-ordering/billState";
import { useGuestBill } from "../../features/guest-ordering/GuestBillProvider";
import { useGuestOrderActions } from "../../features/guest-ordering/hooks/useGuestOrderActions";
import { usePayOnline } from "../../features/guest-ordering/hooks/usePayOnline";
import { useOrderAmendment } from "../../features/order-amendment/hooks/useOrderAmendment";
import { TotalLine } from "../rail";
import BillOrderCard from "./BillOrderCard";
import PayOnlineSection from "./PayOnlineSection";

/** Everything the table has ordered so far, with what is still to pay. */
const BillTab = () => {
  const { orders, paid, frozen, payingOnCardReader, payOnline } = useGuestBill();
  const { canSend, updateOrder, cancelOrder } = useGuestOrderActions();
  const amendment = useOrderAmendment(updateOrder);
  // Lives here, not in the section, so the message stays while the button goes away.
  const onlinePayment = usePayOnline();
  const payable = payableCents(orders);

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-2">
        {orders.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">No orders yet</p>
            <p className="mt-1 text-sm text-ink-soft">Everything you send to the kitchen shows up here, with its status.</p>
          </div>
        )}
        {orders.map((order) => (
          <BillOrderCard key={order._id} order={order} amendment={amendment} canSend={canSend} onCancel={cancelOrder} />
        ))}
      </div>
      <div className="border-t border-ink/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <TotalLine label="Total" cents={payable} strong />
        {orders.length > 0 && <p className="mt-1 text-xs text-ink-soft">Cancelled items aren’t counted.</p>}
        {!paid && frozen && payingOnCardReader && (
          <p className="mt-3 rounded-md bg-signal/10 px-3 py-2 text-center text-sm font-semibold text-ink" role="status">
            Being paid on the card reader
          </p>
        )}
        {!paid && !(frozen && payingOnCardReader) && (
          <PayOnlineSection totalCents={frozen ? null : (payOnline?.totalCents ?? null)} payOnline={onlinePayment} />
        )}
      </div>
    </>
  );
};

export default BillTab;
