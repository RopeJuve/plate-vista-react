import type { ReceiptLine } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { vatRateLetter } from "./receipt";

const head = "pb-1 font-normal text-ink-soft";

/** What was bought: numbered lines with quantity, unit price, line total and the VAT letter. */
const ReceiptPositions = ({ lines }: { lines: ReceiptLine[] }) => (
  <section aria-labelledby="receipt-positions" className="space-y-2">
    <h2 id="receipt-positions" className="text-sm font-bold">
      Positionen
    </h2>
    <table aria-labelledby="receipt-positions" className="w-full table-auto text-xs">
      <thead className="border-b border-paper-line">
        <tr>
          <th scope="col" className={`${head} w-5 text-left`}>Nr</th>
          <th scope="col" className={`${head} text-left`}>Bezeichnung</th>
          <th scope="col" className={`${head} text-right`}>Menge</th>
          <th scope="col" className={`${head} text-right`}>Preis</th>
          <th scope="col" className={`${head} text-right`}>Gesamt</th>
          <th scope="col" className={`${head} w-4 text-right`}>
            <abbr title="Steuersatz">St</abbr>
          </th>
        </tr>
      </thead>
      <tbody className="font-mono tabular">
        {lines.map((line, index) => (
          <tr key={`${index}:${line.title}`} className="align-baseline">
            <td className="py-1 text-left text-ink-soft">{index + 1}</td>
            <td className="break-words py-1 pr-2 text-left font-sans">{line.title}</td>
            <td className="py-1 text-right">{line.quantity}</td>
            <td className="whitespace-nowrap py-1 pl-2 text-right">{formatCents(line.unitPriceCents)}</td>
            <td className="whitespace-nowrap py-1 pl-2 text-right">{formatCents(line.lineTotalCents)}</td>
            <td className="py-1 pl-1 text-right">{vatRateLetter(line.vatRate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export default ReceiptPositions;
