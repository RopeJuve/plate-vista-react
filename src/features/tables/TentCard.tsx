import { QRCode } from "react-qrcode";
import { Wordmark } from "../../Components/rail";
import type { QrTable } from "./tableList";

/** A table tent card: what actually sits on the table. */
const TentCard = ({ table, url, size = 200 }: { table: QrTable; url: string; size?: number }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <Wordmark className="text-ink" />
    <p className="text-sm font-semibold text-ink-soft">Scan to see the menu and order</p>
    <div className="rounded-lg bg-white p-3 ring-1 ring-ink/10">
      <QRCode value={url} size={size} bgcolor="#ffffff" fgcolor="#0e0e0e" />
    </div>
    <p className="flex items-baseline gap-2 leading-none">
      <span className="text-xl font-extrabold uppercase">Table</span>
      <span className="text-5xl font-black tracking-[-0.04em]" style={{ fontVariationSettings: '"wdth" 80' }}>
        {table.tableNumber}
      </span>
    </p>
  </div>
);

export default TentCard;
