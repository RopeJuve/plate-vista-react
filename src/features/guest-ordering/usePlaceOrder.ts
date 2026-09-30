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
import { checkCart } from "./cartLimits";
import type { MenuRecord } from "./menu";
import {
  clearPending,
  invalidatePendingIfCartChanged,
  loadPending,
  resolveClientOrderId,
  savePending,
  toOrderItems,
  type PendingOrder,
} from "./pendingOrder";
import { placeOrderStatus, type PlaceOrderPhase } from "./placeOrderStatus";
import type { CartLine } from "./types";

export type { PlaceOrderPhase } from "./placeOrderStatus";

const hasFields = (details: ErrorDetails): details is ValidationDetails =>
  Boolean(details && typeof details === "object" && "fields" in details);

const productIdsFrom = (details: ErrorDetails): string[] => {
  if (details && typeof details === "object" && "productIds" in details && Array.isArray(details.productIds)) {
    return details.productIds.filter((id): id is string => typeof id === "string");
  }
  return [];
};

const RETRYABLE = new Set(["TIMEOUT", "INTERNAL"]);

type PlaceOrderOptions = {
  /** Where the order being sent is remembered, so a retry resends the same one. */
  storageKey: string;
  /** The lines to order: the guest's cart or the staff pad. */
  lines: CartLine[];
  menuById: Record<string, MenuRecord | undefined>;
  /** Staff only: the table the order is for. A guest's order goes to their own table. */
  tableId?: string;
  /**
   * Runs for every accepted order, including one landed by the reconnect retry
   * below. Everything that must settle after a successful order (clearing the
   * lines, recording it on the bill) belongs here, or a retried order leaves a
   * full cart behind it and invites a duplicate.
   */
  onPlaced?: (order: Order) => void;
  /** Runs when `place` fails. The reconnect retry fails silently; its error is still in `error`. */
  onFailed?: (error: ProtocolError) => void;
};

/**
 * Placing an order from a set of lines. It checks the lines against the menu
 * and the order limits, keeps one clientOrderId per unchanged set of lines so
 * a resend is never a second order, and retries once after a reconnect.
 */
export const usePlaceOrder = ({ storageKey, lines, menuById, tableId, onPlaced, onFailed }: PlaceOrderOptions) => {
  const { request, status, sessionEnded } = useRealtime();
  const onPlacedRef = useRef(onPlaced);
  onPlacedRef.current = onPlaced;
  const onFailedRef = useRef(onFailed);
  onFailedRef.current = onFailed;
  const [phase, setPhase] = useState<PlaceOrderPhase>("idle");
  const [error, setError] = useState<ProtocolError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [outOfStockIds, setOutOfStockIds] = useState<string[]>([]);
  const retryOnceRef = useRef(false);
  const autoRetryRef = useRef(false);
  const sendingRef = useRef(false);
  const canSend = status === "open" && !sessionEnded;
  const check = checkCart(lines, menuById);

  const submit = useCallback(
    async (items: OrderCreateItemInput[], forTableId?: string): Promise<Order> => {
      if (sendingRef.current) {
        throw new ProtocolError("INTERNAL", "Order is already being sent");
      }
      const pending: PendingOrder = resolveClientOrderId(loadPending(storageKey), items, forTableId);
      savePending(storageKey, pending);
      sendingRef.current = true;
      setPhase("sending");
      setError(null);
      setFieldErrors({});
      setOutOfStockIds([]);
      try {
        const payload = forTableId
          ? { clientOrderId: pending.clientOrderId, items: pending.items, tableId: forTableId }
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

  useEffect(() => {
    // Changed lines are a different order: it must not reuse the remembered id.
    invalidatePendingIfCartChanged(storageKey, toOrderItems(lines));
    // onPlaced emptied the lines, so the next order starts clean.
    if (lines.length === 0 && phase === "success") {
      setPhase("idle");
      setError(null);
    }
  }, [lines, phase, storageKey]);

  const place = async () => {
    if (phase === "sending" || check.blocking || lines.length === 0) {
      return;
    }
    try {
      await submit(toOrderItems(lines), tableId);
    } catch (err) {
      onFailedRef.current?.(err as ProtocolError);
    }
  };

  return {
    ...placeOrderStatus({ lines, check, phase, error, outOfStockIds, canSend }),
    phase,
    canSend,
    blocking: check.blocking,
    fieldErrors,
    place,
  };
};

export type PlaceOrder = ReturnType<typeof usePlaceOrder>;
