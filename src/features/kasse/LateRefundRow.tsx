import type { OnlinePaymentRefund } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { formatRefundedAt, refundReasonLabel } from "./lateRefunds";

/** One Late Payment the API refunded: table and amount on top, why and when below. */
const LateRefundRow = ({ refund }: { refund: OnlinePaymentRefund }) => (
  <li className="py-3 first:pt-0 last:pb-0">
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-semibold text-ink">Table {refund.tableNumber}</span>
      <span className="font-mono tabular-nums text-ink">{formatCents(refund.amountCents)}</span>
    </div>
    <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-3 text-sm text-ink-soft">
      <span>{refundReasonLabel(refund.reason)}</span>
      <time dateTime={refund.refundedAt} className="font-mono tabular-nums">
        {formatRefundedAt(refund.refundedAt)}
      </time>
    </div>
  </li>
);

export default LateRefundRow;
