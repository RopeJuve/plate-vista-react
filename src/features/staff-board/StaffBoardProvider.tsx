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
import api from "../../services/api";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import type { ServerEvent, StaffBoard } from "../../shared/realtime/protocol";
import { notify } from "../../utils/notify";
import { boardReducer, emptyBoard, type BoardState } from "./boardState";
import { useSignFailedAlert } from "./hooks/useSignFailedAlert";

type StaffBoardValue = {
  state: BoardState;
  reload: () => Promise<void>;
  /** True while the snapshot is missing, so live events cannot be applied yet. */
  snapshotFailed: boolean;
  /** Answers a table's waiter call; the mark goes when the server confirms it to every screen. */
  dismissWaiterCall: (sessionId: string) => void;
};

const StaffBoardContext = createContext<StaffBoardValue | undefined>(undefined);

const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 10_000;

const asBoard = (data: unknown): StaffBoard => {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const source =
    Array.isArray(record.sessions) || Array.isArray(record.orders) || Array.isArray(record.tables)
      ? record
      : record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : {};
  return {
    sessions: Array.isArray(source.sessions) ? (source.sessions as StaffBoard["sessions"]) : [],
    orders: Array.isArray(source.orders) ? (source.orders as StaffBoard["orders"]) : [],
    tables: Array.isArray(source.tables) ? (source.tables as StaffBoard["tables"]) : [],
    recentlyClosed: Array.isArray(source.recentlyClosed)
      ? (source.recentlyClosed as StaffBoard["recentlyClosed"])
      : [],
  };
};

export const StaffBoardProvider = ({ children }: { children?: ReactNode }) => {
  const { status, subscribe, request } = useRealtime();
  const [state, setState] = useState<BoardState>(emptyBoard);
  const waiterCallsRef = useRef(state.waiterCallsBySession);
  waiterCallsRef.current = state.waiterCallsBySession;
  const [failedAttempts, setFailedAttempts] = useState(0);
  const hydratingRef = useRef(false);
  const queueRef = useRef<ServerEvent[]>([]);
  const generationRef = useRef(0);
  useSignFailedAlert();

  const dispatchEvent = useCallback((event: ServerEvent) => {
    setState((current) => boardReducer(current, { type: "event", event }));
  }, []);

  const flush = useCallback(() => {
    if (hydratingRef.current) {
      return;
    }
    const queued = queueRef.current.splice(0);
    queued.forEach((event) => dispatchEvent(event));
  }, [dispatchEvent]);

  const enqueue = useCallback(
    (event: ServerEvent) => {
      if (hydratingRef.current) {
        queueRef.current.push(event);
        return;
      }
      dispatchEvent(event);
    },
    [dispatchEvent]
  );

  useEffect(() => {
    const offs = [
      subscribe("session.opened", (data) => enqueue({ event: "session.opened", data })),
      subscribe("order.created", (data) => enqueue({ event: "order.created", data })),
      subscribe("order.updated", (data) => enqueue({ event: "order.updated", data })),
      subscribe("order.statusChanged", (data) => enqueue({ event: "order.statusChanged", data })),
      subscribe("session.closed", (data) => enqueue({ event: "session.closed", data })),
      subscribe("bill.paid", (data) => enqueue({ event: "bill.paid", data })),
      subscribe("payment.signed", (data) => enqueue({ event: "payment.signed", data })),
      subscribe("bill.frozen", (data) => enqueue({ event: "bill.frozen", data })),
      subscribe("bill.unfrozen", (data) => enqueue({ event: "bill.unfrozen", data })),
      subscribe("waiter.called", (data) => {
        // The server repeats open calls on every reconnect; only a new one is news.
        if (!waiterCallsRef.current[data.sessionId]) {
          notify(data.tableNumber ? `Table ${data.tableNumber} is calling a waiter` : "A table is calling a waiter", "info");
        }
        enqueue({ event: "waiter.called", data });
      }),
      subscribe("waiter.dismissed", (data) => enqueue({ event: "waiter.dismissed", data })),
    ];
    return () => offs.forEach((off) => off());
  }, [enqueue, subscribe]);

  const reload = useCallback(async () => {
    const generation = ++generationRef.current;
    hydratingRef.current = true;
    queueRef.current = [];
    try {
      const { data } = await api.get("/staff/board");
      if (generation !== generationRef.current) {
        return;
      }
      const events = queueRef.current.splice(0);
      setState((current) => boardReducer(current, { type: "hydrate", board: asBoard(data), events }));
      setFailedAttempts(0);
    } catch {
      // Without a snapshot the reducer discards every live event, so the board
      // would stay blank for the rest of the shift. Schedule another attempt
      // instead of failing silently. Not rethrown: callers await reload() from
      // inside their own error handling.
      if (generation === generationRef.current) {
        setFailedAttempts((attempts) => attempts + 1);
      }
    } finally {
      if (generation === generationRef.current) {
        const leftover = queueRef.current.splice(0);
        hydratingRef.current = false;
        leftover.forEach((event) => dispatchEvent(event));
        flush();
      }
    }
  }, [dispatchEvent, flush]);

  useEffect(() => {
    if (status !== "open") {
      // Waiter calls live only on the socket: the server says the open ones again on reconnect.
      setState((current) => boardReducer(current, { type: "disconnected" }));
      return;
    }
    void reload();
  }, [reload, status]);

  const dismissWaiterCall = useCallback(
    (sessionId: string) => {
      request("waiter.dismiss", { sessionId }).catch(() =>
        notify("Couldn't close the waiter call. Try again.", "error")
      );
    },
    [request]
  );

  useEffect(() => {
    if (failedAttempts === 0 || status !== "open") {
      return;
    }
    const delay = Math.min(RETRY_BASE_MS * 2 ** (failedAttempts - 1), RETRY_MAX_MS);
    const timer = setTimeout(() => {
      void reload();
    }, delay);
    return () => clearTimeout(timer);
  }, [failedAttempts, reload, status]);

  const value = useMemo(
    () => ({ state, reload, snapshotFailed: failedAttempts > 0, dismissWaiterCall }),
    [state, reload, failedAttempts, dismissWaiterCall]
  );

  return <StaffBoardContext.Provider value={value}>{children}</StaffBoardContext.Provider>;
};

export const useStaffBoard = () => {
  const context = useContext(StaffBoardContext);
  if (!context) {
    throw new Error("useStaffBoard must be used within StaffBoardProvider");
  }
  return context;
};
