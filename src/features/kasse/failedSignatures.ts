import { format } from "date-fns/format";
import { isValid } from "date-fns/isValid";
import { parseISO } from "date-fns/parseISO";
import type { FailedSignature, FailedSignatureKind } from "../../shared/api/payments";

export type FailedSignatureBadge = { tone: "ok" | "alert"; label: string };

/** Green "All signed" when nothing waits for a signature, red with the count otherwise. */
export const failedSignatureBadge = (count: number): FailedSignatureBadge =>
  count > 0
    ? { tone: "alert", label: `${count} failed signature${count === 1 ? "" : "s"}` }
    : { tone: "ok", label: "All signed" };

export const failedKindLabel = (kind: FailedSignatureKind) => (kind === "PAYMENT" ? "Payment" : "Order");

/** When the signature failed, e.g. 07.11.2026, 20:12. */
export const formatFailedAt = (iso: string) => {
  if (!iso) {
    return "";
  }
  const date = parseISO(iso);
  return isValid(date) ? format(date, "dd.MM.yyyy, HH:mm") : "";
};

const matches = (row: FailedSignature, kind: FailedSignatureKind, id: string) => row.kind === kind && row.id === id;

/** The list after a retry signed this row. */
export const withoutSignature = (rows: FailedSignature[], kind: FailedSignatureKind, id: string) =>
  rows.filter((row) => !matches(row, kind, id));

/** The list after a retry failed again: the row stays with one more attempt. */
export const withFailedAttempt = (rows: FailedSignature[], kind: FailedSignatureKind, id: string) =>
  rows.map((row) => (matches(row, kind, id) ? { ...row, retryCount: row.retryCount + 1 } : row));

export const signatureKey = (row: Pick<FailedSignature, "kind" | "id">) => `${row.kind}:${row.id}`;
