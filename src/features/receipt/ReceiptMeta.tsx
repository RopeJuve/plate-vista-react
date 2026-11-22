import type { Receipt } from "../../shared/api/payments";
import { formatReceiptDateTime, formatServicePeriod } from "./receipt";
import { ReceiptField, ReceiptFields } from "./ReceiptFields";

/** The "Beleg" block: which receipt this is, for which table and which stretch of the visit. */
const ReceiptMeta = ({ receipt }: { receipt: Receipt }) => (
  <section aria-labelledby="receipt-title" className="space-y-3">
    <h2 id="receipt-title" className="text-center text-xl font-black tracking-[-0.02em]">
      Beleg
    </h2>
    <ReceiptFields label="Belegdaten">
      <ReceiptField label="Beleg-Nr">
        {receipt.receiptNumber ?? <span className="text-ink-soft">wird nachgereicht</span>}
      </ReceiptField>
      <ReceiptField label="Datum">{formatReceiptDateTime(receipt.paidAt)}</ReceiptField>
      {receipt.tableNumber != null && <ReceiptField label="Tisch">{receipt.tableNumber}</ReceiptField>}
      <ReceiptField label="Leistungszeitraum">{formatServicePeriod(receipt.servicePeriod)}</ReceiptField>
    </ReceiptFields>
  </section>
);

export default ReceiptMeta;
