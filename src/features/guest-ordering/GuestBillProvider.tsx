import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import type { Order, SessionBill } from "../../shared/realtime/protocol";
import { notify } from "../../utils/notify";
import { receiptPath } from "../payments/billPayment";
import {
  applyBillEvent,
  billOrders,
  clearBill,
  loadBill,
  markBillFrozen,
  markBillPaid,
  saveBill,
  upsertBillOrder,
  withServerBill,
  type BillOrder,
  type BillState,
  type PaidBill,
} from "./billState";
import { useGuestAuth } from "./GuestAuthContext";
import { useServerBill } from "./hooks/useServerBill";

type GuestBillValue = {
  orders: BillOrder[];
  closed: boolean;
  /** Set once the bill is paid: the guest can no longer add to it. */
  paid: PaidBill | null;
  rememberOrder: (order: Order) => void;
  /** An order command came back `BILL_PAID`: lock the bill and look up its receipt. */
  markPaid: () => void;
  /** Someone at the table is paying online: no ordering or cancelling until it ends. */
  frozen: boolean;
  /** An order command came back `BILL_FROZEN`: lock the bill and read it again. */
  markFrozen: () => void;
  /** Set while the guest may pay the bill online, with the total they would pay. */
  payOnline: BillState["payOnline"];
  /** Read the bill from the server again, e.g. after online payment was refused. */
  recheckBill: () => void;
};

const BILL_RECHECK_DELAY_MS = 300;

const GuestBillContext = createContext<GuestBillValue | undefined>(undefined);

export const GuestBillProvider = ({
  sessionId,
  children,
}: {
  sessionId: string;
  children?: ReactNode;
}) => {
  const { subscribe, sessionEnded } = useRealtime();
  const { session } = useGuestAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<BillState>(() => loadBill(sessionId));
  const [billChecks, setBillChecks] = useState(0);

  const handleServerBill = useCallback((bill: SessionBill) => {
    setState((current) => withServerBill(current, bill));
  }, []);
  useServerBill(sessionId, session?.token, billChecks, handleServerBill);

  const recheckBill = useCallback(() => setBillChecks((count) => count + 1), []);

  // Whether and how much the guest can pay online is the server's call, so a
  // change to the table's orders reads the bill again. A burst of events (a
  // whole round served at once) makes one read, not one per event.
  const billChangeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const recheckBillSoon = useCallback(() => {
    clearTimeout(billChangeTimer.current);
    billChangeTimer.current = setTimeout(recheckBill, BILL_RECHECK_DELAY_MS);
  }, [recheckBill]);
  useEffect(() => () => clearTimeout(billChangeTimer.current), []);

  useEffect(() => {
    setState(loadBill(sessionId));
  }, [sessionId]);

  useEffect(() => {
    saveBill(sessionId, state);
  }, [sessionId, state]);

  useEffect(() => {
    const offCreated = subscribe("order.created", (data) => {
      setState((current) => applyBillEvent(current, { event: "order.created", data }, sessionId));
      if (data.order.sessionId === sessionId) {
        recheckBillSoon();
      }
    });
    const offUpdated = subscribe("order.updated", (data) => {
      setState((current) => applyBillEvent(current, { event: "order.updated", data }, sessionId));
      if (data.order.sessionId === sessionId) {
        recheckBillSoon();
      }
    });
    const offStatus = subscribe("order.statusChanged", (data) => {
      // A guest's socket only hears its own table's orders; a cancel changes the total.
      recheckBillSoon();
      setState((current) => {
        const previous = current.ordersById[data.orderId];
        const next = applyBillEvent(current, { event: "order.statusChanged", data }, sessionId);
        if (previous && previous.status !== "ready" && data.status === "ready" && data.rev > previous.rev) {
          notify("Your order is ready", "success");
        }
        return next;
      });
    });
    const offClosed = subscribe("session.closed", (data) => {
      setState((current) => applyBillEvent(current, { event: "session.closed", data }, sessionId));
    });
    const offPaid = subscribe("bill.paid", (data) => {
      if (data.sessionId !== sessionId) {
        return;
      }
      setState((current) => applyBillEvent(current, { event: "bill.paid", data }, sessionId));
      navigate(receiptPath(data.receiptToken));
    });
    const offFrozen = subscribe("bill.frozen", (data) => {
      setState((current) => applyBillEvent(current, { event: "bill.frozen", data }, sessionId));
    });
    const offUnfrozen = subscribe("bill.unfrozen", (data) => {
      if (data.sessionId !== sessionId) {
        return;
      }
      setState((current) => applyBillEvent(current, { event: "bill.unfrozen", data }, sessionId));
      // Whether it can be paid online again is the server's call.
      recheckBill();
    });
    return () => {
      offCreated();
      offUpdated();
      offStatus();
      offClosed();
      offPaid();
      offFrozen();
      offUnfrozen();
    };
  }, [navigate, recheckBill, recheckBillSoon, sessionId, subscribe]);

  const rememberOrder = useCallback((order: Order) => {
    setState((current) => upsertBillOrder(current, order));
  }, []);

  const markPaid = useCallback(() => {
    setState(markBillPaid);
    recheckBill();
  }, [recheckBill]);

  const markFrozen = useCallback(() => {
    setState(markBillFrozen);
    recheckBill();
  }, [recheckBill]);

  const orders = useMemo(() => billOrders(state), [state]);
  const closed = state.closed || sessionEnded;

  useEffect(() => {
    if (closed) {
      clearBill(sessionId);
    }
  }, [closed, sessionId]);

  const value = useMemo(
    () => ({
      orders,
      closed,
      paid: state.paid,
      rememberOrder,
      markPaid,
      frozen: state.frozen,
      markFrozen,
      payOnline: state.payOnline,
      recheckBill,
    }),
    [orders, closed, state.paid, rememberOrder, markPaid, state.frozen, markFrozen, state.payOnline, recheckBill]
  );

  return <GuestBillContext.Provider value={value}>{children}</GuestBillContext.Provider>;
};

export const useGuestBill = () => {
  const context = useContext(GuestBillContext);
  if (!context) {
    throw new Error("useGuestBill must be used within GuestBillProvider");
  }
  return context;
};
