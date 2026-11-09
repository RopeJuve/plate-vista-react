import type { TseStatus } from "../../shared/api/payments";
import { formatTseDate } from "./tseActivation";

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">{label}</dt>
    <dd className="mt-1 break-all font-mono text-sm text-ink">{value || "—"}</dd>
  </div>
);

/** The switched-on TSE: which security module signs this restaurant's orders and payments, and since when. */
const TseActiveDetails = ({ tse }: { tse: TseStatus }) => (
  <div className="space-y-4">
    <p className="text-sm text-ink-soft">Every order and payment is signed. You can take payments.</p>
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Detail label="TSS serial" value={tse.tssSerial ?? ""} />
      <Detail label="Client ID" value={tse.clientId ?? ""} />
      <Detail label="Activated on" value={formatTseDate(tse.setupAt)} />
    </dl>
  </div>
);

export default TseActiveDetails;
