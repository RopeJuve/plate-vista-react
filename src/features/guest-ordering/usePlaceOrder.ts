import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import {
  ProtocolError,
  type AckOrderData,
  type ErrorDetails,
  type Order,
  type OrderCreateItemInput,
  type ValidationDetails,
} from "../../shared/realtime/protocol";
import {
  clearPending,
  loadPending,
  resolveClientOrderId,
  savePending,
  type PendingOrder,
} from "./pendingOrder";

export type PlaceOrderPhase = "idle" | "sending" | "success" | "error";

const hasFields = (details: ErrorDetails): details is ValidationDetails =>
  Boolean(details && typeof details === "object" && "fields" in details);

const productIdsFrom = (details: ErrorDetails): string[] => {
  if (details && typeof details === "object" && "productIds" in details && Array.isArray(details.productIds)) {
    return details.productIds.filter((id): id is string => typeof id === "string");
  }
  return [];
};

const RETRYABLE = new Set(["TIMEOUT", "INTERNAL"]);

/**
 * @param onPlaced Runs for every accepted order, including one landed by the
 *   reconnect retry below. Everything that must settle after a successful
 *   order (clearing the cart, recording it on the bill) belongs here — a caller
 *   that only acts on `submit`'s return value misses the retry, leaving a full
 *   cart behind a placed order and inviting a duplicate.
 */
export const usePlaceOrder = (storageKey: string, onPlaced?: (order: Order) => void) => {
  const { request, status, sessionEnded } = useRealtime();
  const onPlacedRef = useRef(onPlaced);
  onPlacedRef.current = onPlaced;
  const [phase, setPhase] = useState<PlaceOrderPhase>("idle");
  const [error, setError] = useState<ProtocolError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [outOfStockIds, setOutOfStockIds] = useState<string[]>([]);
  const retryOnceRef = useRef(false);
  const autoRetryRef = useRef(false);
  const sendingRef = useRef(false);

  const submit = useCallback(
    async (items: OrderCreateItemInput[], tableId?: string): Promise<Order> => {
      if (sendingRef.current) {
        throw new ProtocolError("INTERNAL", "Order is already being sent");
      }
      const pending: PendingOrder = resolveClientOrderId(loadPending(storageKey), items, tableId);
      savePending(storageKey, pending);
      sendingRef.current = true;
      setPhase("sending");
      setError(null);
      setFieldErrors({});
      setOutOfStockIds([]);
      try {
        const payload = tableId
          ? { clientOrderId: pending.clientOrderId, items: pending.items, tableId }
          : { clientOrderId: pending.clientOrderId, items: pending.items };
        const data = await request<"order.create", AckOrderData>("order.create", payload);
        clearPending(storageKey);
        setPhase("success");
        retryOnceRef.current = false;
        onPlacedRef.current?.(data.order);
        return data.order;
      } catch (err) {
        const protocolError =
          err instanceof ProtocolError ? err : new ProtocolError("INTERNAL", "Could not place the order");
        setError(protocolError);
        setPhase("error");
        if (hasFields(protocolError.details)) {
          setFieldErrors(protocolError.details.fields);
        }
        if (protocolError.code === "OUT_OF_STOCK") {
          setOutOfStockIds(productIdsFrom(protocolError.details));
        }
        if (protocolError.code === "SESSION_CLOSED") {
          // The table was closed while this was in flight. Never resend it:
          // it would land on the next party's check.
          clearPending(storageKey);
        }
        if (RETRYABLE.has(protocolError.code) && !autoRetryRef.current) {
          retryOnceRef.current = true;
        }
        throw protocolError;
      } finally {
        sendingRef.current = false;
      }
    },
    [request, storageKey]
  );

  useEffect(() => {
    if (status !== "open" || sessionEnded || !retryOnceRef.current || sendingRef.current) {
      return;
    }
    const pending = loadPending(storageKey);
    retryOnceRef.current = false;
    if (!pending) {
      return;
    }
    autoRetryRef.current = true;
    void submit(pending.items, pending.tableId)
      .catch(() => undefined)
      .finally(() => {
        autoRetryRef.current = false;
      });
  }, [sessionEnded, status, storageKey, submit]);

  const resetPhase = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  return {
    phase,
    error,
    fieldErrors,
    outOfStockIds,
    submit,
    resetPhase,
    canSend: status === "open" && !sessionEnded,
  };
};
