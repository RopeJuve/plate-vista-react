import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useOrder } from "../../contexts/OrderContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { usePlaceOrder } from "../../features/guest-ordering/hooks/usePlaceOrder";
import PayBillPanel from "../../features/payments/PayBillPanel";
import { useOrderAmendment } from "../../features/order-amendment/hooks/useOrderAmendment";
import { sessionPayment, tableCheck } from "../../features/staff-board/boardState";
import { canCloseUnpaid } from "../../features/staff-board/closeTable";
import { useCloseTable } from "../../features/staff-board/hooks/useCloseTable";
import { useOrderActions } from "../../features/staff-board/hooks/useOrderActions";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import { errorMessage } from "../../shared/realtime/errorMessages";
import { notify } from "../../utils/notify";
import CheckFooter from "./CheckFooter";
import CheckHeader from "./CheckHeader";
import CheckOrder from "./CheckOrder";
import CloseTableDialog from "./CloseTableDialog";
import CloseUnpaidDialog from "./CloseUnpaidDialog";
import UnsentLines from "./UnsentLines";
import { cn } from "@/lib/utils";

/** A table's check on the staff screen: what was sent, what is about to be, settling the bill, and closing the table. */
const OrderDetails = () => {
  const { tableId = "" } = useParams();
  const { pad, clearPad } = useOrder();
  const { itemsById } = useMenu();
  const { state } = useStaffBoard();
  const { user } = useAuth();
  const { canSend, closeSession, updateOrder } = useOrderActions();
  const placeOrder = usePlaceOrder({
    storageKey: `staff:${tableId}`,
    lines: pad,
    menuById: itemsById,
    tableId,
    onPlaced: () => {
      clearPad();
      notify("Order placed", "success");
    },
    onFailed: (error) => notify(errorMessage(error.code, error.details, error.message)),
  });
  const amendment = useOrderAmendment(updateOrder);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { table, sessionId, joinCode, orders, totalCents } = useMemo(() => tableCheck(state, tableId), [state, tableId]);
  const payment = sessionPayment(state, sessionId);
  // A payment or signature heard live reloads the bill, so the panel shows it as paid or signed.
  const paymentKey = payment ? `${payment.paymentId}:${payment.signed}` : "";
  const closing = useCloseTable(sessionId, closeSession);
  const handleDialogChange = (dialog: "confirm" | "unpaid") => (open: boolean) =>
    closing.setDialog(open ? dialog : null);

  return (
    <section
      aria-labelledby="check-title"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex max-h-[88dvh] flex-col rounded-t-2xl bg-paper text-ink shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.6)]",
        "lg:static lg:z-auto lg:max-h-none lg:min-h-0 lg:rounded-xl lg:shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]"
      )}
    >
      <CheckHeader
        tableNumber={table?.tableNumber}
        capacity={table?.capacity}
        joinCode={joinCode}
        sheetOpen={sheetOpen}
        onToggleSheet={() => setSheetOpen((open) => !open)}
      />
      <div className="perf mx-5" />

      <div
        id="check-lines"
        className={cn("min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4", !sheetOpen && "hidden lg:block")}
      >
        {orders.length === 0 && pad.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-soft">
            Nothing on this check yet. Tap items on the menu to start it.
          </p>
        )}
        {orders.map((order) => (
          <CheckOrder key={order._id} order={order} amendment={amendment} canSend={canSend} />
        ))}
        <UnsentLines />
        {placeOrder.cartIssue && <p className="text-sm font-semibold text-alert-ink">{placeOrder.cartIssue}</p>}
      </div>

      {sessionId && (
        <div className="border-t border-dashed border-ink/20 px-5 py-3">
          {/* Bar and kitchen staff cannot open the till settings, so a missing TSE goes to the owner. */}
          <PayBillPanel
            key={sessionId}
            sessionId={sessionId}
            refreshKey={`${totalCents}:${closing.billReloads}:${paymentKey}`}
            canActivateTse={false}
            onBillChange={closing.setBill}
          />
        </div>
      )}

      <CheckFooter
        totalCents={totalCents}
        canSend={canSend}
        canClose={Boolean(sessionId)}
        closeBlock={closing.block}
        canCloseUnpaid={canCloseUnpaid(user)}
        closeNotice={closing.notice}
        placeOrder={placeOrder}
        onCloseTable={() => closing.setDialog("confirm")}
        onCloseUnpaid={() => closing.setDialog("unpaid")}
      />

      <CloseTableDialog
        tableNumber={table?.tableNumber}
        totalCents={totalCents}
        open={closing.dialog === "confirm"}
        onOpenChange={handleDialogChange("confirm")}
        onConfirm={() => closing.close()}
      />
      <CloseUnpaidDialog
        tableNumber={table?.tableNumber}
        totalCents={totalCents}
        open={closing.dialog === "unpaid"}
        onOpenChange={handleDialogChange("unpaid")}
        onConfirm={closing.close}
      />
    </section>
  );
};

export default OrderDetails;
