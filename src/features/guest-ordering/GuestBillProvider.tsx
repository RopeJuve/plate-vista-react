import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import type { Order } from "../../shared/realtime/protocol";
import { notify } from "../../utils/notify";
import {
  applyBillEvent,
  billOrders,
  clearBill,
  loadBill,
  saveBill,
  upsertBillOrder,
  type BillOrder,
  type BillState,
} from "./billState";

type GuestBillValue = {
  orders: BillOrder[];
  closed: boolean;
  rememberOrder: (order: Order) => void;
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
  const [state, setState] = useState<BillState>(() => loadBill(sessionId));

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
    return () => {
      offCreated();
      offUpdated();
      offStatus();
      offClosed();
    };
  }, [sessionId, subscribe]);

  const rememberOrder = useCallback((order: Order) => {
    setState((current) => upsertBillOrder(current, order));
  }, []);

  const orders = useMemo(() => billOrders(state), [state]);
  const closed = state.closed || sessionEnded;

  useEffect(() => {
    if (closed) {
      clearBill(sessionId);
    }
  }, [closed, sessionId]);

  const value = useMemo(
    () => ({ orders, closed, rememberOrder }),
    [orders, closed, rememberOrder]
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
