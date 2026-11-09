import { cn } from "@/lib/utils";
import type { ReceiptSignature } from "../../shared/api/payments";
import { useQrCodeSrc } from "./hooks/useQrCodeSrc";
import { formatReceiptDateTime } from "./receipt";

const Field = ({ label, value, wrap = false }: { label: string; value: string; wrap?: boolean }) => (
  <div className={cn("flex gap-3", wrap && "flex-col gap-0.5")}>
    <dt className="shrink-0 text-ink-soft">{label}</dt>
    <dd className={cn("min-w-0 font-mono", wrap ? "break-all" : "ml-auto text-right")}>{value}</dd>
  </div>
);

/** The TSE's proof that this payment was recorded: transaction, times, counter, signature and its QR code. */
const ReceiptTseBlock = ({ signature }: { signature: ReceiptSignature }) => {
  const qrSrc = useQrCodeSrc(signature.qrCodeData);

  return (
    <section aria-label="TSE-Signatur" className="space-y-4">
      <dl className="space-y-1.5 text-xs">
        <Field label="Transaktionsnummer" value={String(signature.txNumber ?? "")} />
        <Field label="Start" value={formatReceiptDateTime(signature.timeStart)} />
        <Field label="Ende" value={formatReceiptDateTime(signature.timeEnd)} />
        <Field label="Signaturzähler" value={String(signature.counter ?? "")} />
        <Field label="Signatur" value={signature.value ?? ""} wrap />
        <Field label="TSE-Seriennummer" value={signature.tssSerial ?? ""} wrap />
        <Field label="Kassen-Seriennummer" value={signature.clientSerial ?? ""} wrap />
      </dl>
      {qrSrc && (
        <img
          src={qrSrc}
          alt="QR-Code der TSE-Signatur"
          width={176}
          height={176}
          className="mx-auto size-44 bg-white"
        />
      )}
    </section>
  );
};

export default ReceiptTseBlock;
