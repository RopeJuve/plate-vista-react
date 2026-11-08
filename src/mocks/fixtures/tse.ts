import type { FailedSignature, TseStatus } from "../../shared/api/payments";

export const inactiveTse: TseStatus = { active: false, failedSignatures: 0 };

export const activeTse: TseStatus = {
  active: true,
  tssSerial: "tss-serial-0001",
  clientId: "client-0001",
  setupAt: "2026-11-01T09:00:00.000Z",
  failedSignatures: 0,
};

export const failedSignatures: FailedSignature[] = [
  {
    kind: "PAYMENT",
    id: "payment-failed-1",
    tableNumber: 4,
    at: "2026-11-07T19:12:00.000Z",
    amountCents: 4250,
    error: "TSS unreachable",
    retryCount: 1,
  },
  {
    kind: "PAYMENT",
    id: "payment-failed-2",
    tableNumber: 7,
    at: "2026-11-07T20:03:00.000Z",
    amountCents: 1890,
    error: "TSS unreachable",
    retryCount: 2,
  },
  {
    kind: "ORDER",
    id: "order-failed-1",
    tableNumber: 2,
    at: "2026-11-07T20:40:00.000Z",
    amountCents: 990,
    error: "Signature timeout",
    retryCount: 0,
  },
];

export const activeTseWithFailures: TseStatus = {
  ...activeTse,
  failedSignatures: failedSignatures.length,
};
