import type { Payment } from "../../shared/api/payments";
import { clockTime } from "../../services/time";
import { methodLabel, receiptPath } from "./billPayment";
import { useReceiptQr } from "./hooks/useReceiptQr";

/** A settled bill: how and when it was paid, and the receipt the guest can scan or open. */
const PaidBill = ({ payment }: { payment: Payment }) => {
  const { url, src } = useReceiptQr(payment.receiptToken);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-pass-ink">
          Paid · {methodLabel(payment.method)} · {clockTime(payment.paidAt)}
        </p>
        {payment.signature.status !== "SIGNED" && <p className="text-xs text-ink-soft">Signature pending</p>}
        <a
          href={receiptPath(payment.receiptToken)}
          target="_blank"
          rel="noreferrer"
          className="inline-block py-1 text-sm font-bold text-ink underline underline-offset-2"
        >
          Show receipt
        </a>
      </div>
      {src && (
        <img
          src={src}
          data-url={url}
          alt="QR code for the receipt"
          className="size-28 shrink-0 rounded-md bg-white p-1 ring-1 ring-ink/10"
        />
      )}
    </div>
  );
};

export default PaidBill;
