import { TotalLine } from "../../Components/rail";
import type { Receipt } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { formatReceiptDateTime, paymentMethodLabel } from "./receipt";
import ReceiptTseBlock from "./ReceiptTseBlock";
import ReceiptVatTotals from "./ReceiptVatTotals";

/** The guest's receipt as the restaurant must hand it out; `notice` stands in for the TSE block until it is signed. */
const ReceiptView = ({ receipt, notice }: { receipt: Receipt; notice: string | null }) => {
  const { restaurant, signature } = receipt;

  return (
    <article className="space-y-5 text-left">
      <header className="space-y-0.5 text-center text-sm">
        <h1 className="mb-1 text-2xl font-black tracking-[-0.03em]">{restaurant.name}</h1>
        <p>{restaurant.legalName}</p>
        <p>{restaurant.address.street}</p>
        <p>{`${restaurant.address.zip} ${restaurant.address.city}`}</p>
        {restaurant.taxNumber && <p className="text-ink-soft">{`Steuernummer: ${restaurant.taxNumber}`}</p>}
        {restaurant.vatId && <p className="text-ink-soft">{`USt-IdNr.: ${restaurant.vatId}`}</p>}
        <p className="pt-2 font-mono text-xs text-ink-soft">{formatReceiptDateTime(receipt.paidAt)}</p>
      </header>

      <div className="perf" />

      <ul aria-label="Positionen" className="space-y-1.5 text-sm">
        {receipt.lines.map((line, index) => (
          <li key={`${index}:${line.title}`} className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1 break-words">
              <span className="font-mono tabular text-ink-soft">{`${line.quantity} × `}</span>
              {line.title}
            </span>
            <span className="font-mono tabular">{formatCents(line.lineTotalCents)}</span>
          </li>
        ))}
      </ul>

      <div className="perf" />

      <div className="space-y-2">
        <TotalLine label="Summe" cents={receipt.totalCents} strong />
        <div className="flex items-baseline gap-2 font-mono text-sm text-ink-soft">
          <span className="uppercase tracking-[0.1em]">Zahlungsart</span>
          <span className="leader" aria-hidden="true" />
          <span className="font-bold text-ink">{paymentMethodLabel(receipt.method)}</span>
        </div>
      </div>

      <ReceiptVatTotals totals={receipt.totalsByVat} />

      <div className="perf" />

      {signature.status === "SIGNED" ? (
        <ReceiptTseBlock signature={signature} />
      ) : (
        <p role="status" className="text-center text-sm font-semibold text-ink-soft">
          {notice}
        </p>
      )}
    </article>
  );
};

export default ReceiptView;
