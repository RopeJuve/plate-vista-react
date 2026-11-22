import { TotalLine } from "../../Components/rail";
import type { Receipt } from "../../shared/api/payments";
import ReceiptHospitality from "./ReceiptHospitality";
import ReceiptMeta from "./ReceiptMeta";
import ReceiptPayment from "./ReceiptPayment";
import ReceiptPositions from "./ReceiptPositions";
import ReceiptTseBlock from "./ReceiptTseBlock";
import ReceiptVatTotals from "./ReceiptVatTotals";

const RestaurantHeader = ({ restaurant }: { restaurant: Receipt["restaurant"] }) => (
  <header className="space-y-0.5 text-center text-sm">
    <h1 className="mb-1 text-2xl font-black tracking-[-0.03em]">{restaurant.name}</h1>
    <p>{restaurant.legalName}</p>
    <p>{restaurant.address.street}</p>
    <p>{`${restaurant.address.zip} ${restaurant.address.city}`}</p>
    {restaurant.taxNumber && <p className="text-ink-soft">{`Steuernummer: ${restaurant.taxNumber}`}</p>}
    {restaurant.vatId && <p className="text-ink-soft">{`USt-IdNr.: ${restaurant.vatId}`}</p>}
  </header>
);

/** The guest's receipt as the restaurant must hand it out; `notice` stands in for the TSE block until it is signed. */
const ReceiptView = ({ receipt, notice }: { receipt: Receipt; notice: string | null }) => (
  <article className="space-y-5 text-left">
    <RestaurantHeader restaurant={receipt.restaurant} />
    <div className="perf" />
    <ReceiptMeta receipt={receipt} />
    <ReceiptPositions lines={receipt.lines} />
    <div className="border-t-2 border-ink pt-2">
      <TotalLine label="Summe" cents={receipt.totalCents} strong />
    </div>
    <ReceiptVatTotals totals={receipt.totalsByVat} />
    <div className="perf" />
    <ReceiptPayment receipt={receipt} />
    <div className="perf" />
    <ReceiptHospitality />
    <div className="perf" />
    {receipt.signature.status === "SIGNED" ? (
      <ReceiptTseBlock signature={receipt.signature} />
    ) : (
      <p role="status" className="text-center text-sm font-semibold text-ink-soft">
        {notice}
      </p>
    )}
    <p className="pt-2 text-center text-sm font-bold">Danke für Ihren Besuch!</p>
  </article>
);

export default ReceiptView;
