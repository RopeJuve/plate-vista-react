import type { ReceiptVatTotal } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { vatRateLabel, vatRateLetter } from "./receipt";

/** The VAT breakdown a German receipt must show: net, tax and gross for each rate, by its letter. */
const ReceiptVatTotals = ({ totals }: { totals: ReceiptVatTotal[] }) => (
  <table aria-label="Mehrwertsteuer" className="w-full font-mono text-xs tabular">
    <thead>
      <tr className="text-ink-soft">
        <th scope="col" className="pb-1 text-left font-normal">Satz</th>
        <th scope="col" className="pb-1 text-right font-normal">Netto</th>
        <th scope="col" className="pb-1 text-right font-normal">USt</th>
        <th scope="col" className="pb-1 text-right font-normal">Brutto</th>
      </tr>
    </thead>
    <tbody>
      {totals.map((total) => (
        <tr key={total.vatRate}>
          <td className="py-0.5 text-left">{`${vatRateLetter(total.vatRate)} ${vatRateLabel(total.vatRate)}`}</td>
          <td className="py-0.5 text-right">{formatCents(total.netCents)}</td>
          <td className="py-0.5 text-right">{formatCents(total.vatCents)}</td>
          <td className="py-0.5 text-right">{formatCents(total.grossCents)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ReceiptVatTotals;
