import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Payment } from "../../shared/api/payments";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import type { Order } from "../../shared/realtime/protocol";
import { notify } from "../../utils/notify";
import { receiptPath } from "../payments/billPayment";
import {
  applyBillEvent,
  billOrders,
  clearBill,
  loadBill,
  markBillPaid,
  saveBill,
  upsertBillOrder,
  withServerPayment,
  type BillOrder,
  type BillState,
  type PaidBill,
} from "./billState";
import { useGuestAuth } from "./GuestAuthContext";
import { useServerPayment } from "./hooks/useServerPayment";

type GuestBillValue = {
  orders: BillOrder[];
  closed: boolean;
  /** Set once the bill is paid: the guest can no longer add to it. */
  paid: PaidBill | null;
  rememberOrder: (order: Order) => void;
  /** An order command came back `BILL_PAID`: lock the bill and look up its receipt. */
  markPaid: () => void;
};

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
  const [paymentChecks, setPaymentChecks] = useState(0);

  const handleServerPayment = useCallback((payment: Payment | null) => {
    setState((current) => withServerPayment(current, payment));
  }, []);
  useServerPayment(sessionId, session?.token, paymentChecks, handleServerPayment);

  useEffect(() => {
    setState(loadBill(sessionId));
  }, [sessionId]);

  useEffect(() => {
    saveBill(sessionId, state);
  }, [sessionId, state]);

  useEffect(() => {
    const offCreated = subscribe("order.created", (data) => {
      setState((current) => applyBillEvent(current, { event: "order.created", data }, sessionId));
    });
    const offUpdated = subscribe("order.updated", (data) => {
      setState((current) => applyBillEvent(current, { event: "order.updated", data }, sessionId));
    });
    const offStatus = subscribe("order.statusChanged", (data) => {
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
    return () => {
      offCreated();
      offUpdated();
      offStatus();
      offClosed();
      offPaid();
    };
  }, [navigate, sessionId, subscribe]);

  const rememberOrder = useCallback((order: Order) => {
    setState((current) => upsertBillOrder(current, order));
  }, []);

  const markPaid = useCallback(() => {
    setState(markBillPaid);
    setPaymentChecks((count) => count + 1);
  }, []);

  const orders = useMemo(() => billOrders(state), [state]);
  const closed = state.closed || sessionEnded;

  useEffect(() => {
    if (closed) {
      clearBill(sessionId);
    }
  }, [closed, sessionId]);

  const value = useMemo(
    () => ({ orders, closed, paid: state.paid, rememberOrder, markPaid }),
    [orders, closed, state.paid, rememberOrder, markPaid]
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
