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
import { boardReducer, emptyBoard, type BoardState } from "./boardState";

type StaffBoardValue = {
  state: BoardState;
  reload: () => Promise<void>;
};

const StaffBoardContext = createContext<StaffBoardValue | undefined>(undefined);

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
  };
};

export const StaffBoardProvider = ({ children }: { children?: ReactNode }) => {
  const { status, subscribe } = useRealtime();
  const [state, setState] = useState<BoardState>(emptyBoard);
  const hydratingRef = useRef(false);
  const queueRef = useRef<ServerEvent[]>([]);
  const generationRef = useRef(0);

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
      setState(boardReducer(emptyBoard(), { type: "hydrate", board: asBoard(data), events }));
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
      return;
    }
    void reload();
  }, [reload, status]);

  const value = useMemo(() => ({ state, reload }), [state, reload]);

  return <StaffBoardContext.Provider value={value}>{children}</StaffBoardContext.Provider>;
};

export const useStaffBoard = () => {
  const context = useContext(StaffBoardContext);
  if (!context) {
    throw new Error("useStaffBoard must be used within StaffBoardProvider");
  }
  return context;
};
