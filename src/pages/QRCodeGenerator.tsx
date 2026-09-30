import { QRCode } from "react-qrcode";
import { useEffect, useMemo, useState } from "react";
import { Printer, RefreshCw } from "lucide-react";
import { fetchTables } from "../services/tableDataFetch";
import api from "../services/api";
import { notify } from "../utils/notify";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../Components/AdminComponents";
import { Chit, Wordmark } from "../Components/rail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QrTable = {
  _id: string;
  tableNumber: number;
  qrCode: string;
};

const getFrontendUrl = () => String(import.meta.env.VITE_PLATE_VISTA_URL || "").replace(/\/$/, "");

const guestUrl = (slug: string, qrCode: string) => `${getFrontendUrl()}/r/${slug}/t/${qrCode}`;

/** A table tent card: what actually sits on the table. */
const TentCard = ({ table, slug, size = 200 }: { table: QrTable; slug: string; size?: number }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <Wordmark className="text-ink" />
    <p className="text-sm font-semibold text-ink-soft">Scan to see the menu and order</p>
    <div className="rounded-lg bg-white p-3 ring-1 ring-ink/10">
      <QRCode value={guestUrl(slug, table.qrCode)} size={size} bgcolor="#ffffff" fgcolor="#0e0e0e" />
    </div>
    <p className="flex items-baseline gap-2 leading-none">
      <span className="text-xl font-extrabold uppercase">Table</span>
      <span className="text-5xl font-black tracking-[-0.04em]" style={{ fontVariationSettings: '"wdth" 80' }}>
        {table.tableNumber}
      </span>
    </p>
  </div>
);

const QRCodeGenerator = () => {
  const [tables, setTables] = useState<QrTable[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const slug = useAuth().restaurantSlug || "";
  const [configError, setConfigError] = useState("");
  const [printAll, setPrintAll] = useState(false);

  useEffect(() => {
    if (!getFrontendUrl()) {
      setConfigError("VITE_PLATE_VISTA_URL is not set");
      return;
    }

    fetchTables()
      .then((response) => {
        const raw = Array.isArray(response.data) ? response.data : response.data?.tables || [];
        const tableList: QrTable[] = raw
          .filter((table: { _id?: string; qrCode?: string }) => table?._id && table?.qrCode)
          .map((table: { _id?: string; qrCode?: string; tableNumber?: number }) => ({
            _id: String(table._id),
            tableNumber: Number(table.tableNumber),
            qrCode: String(table.qrCode),
          }));
        setTables(tableList);
        if (tableList[0]) {
          setSelectedId(tableList[0]._id);
        }
      })
      .catch((error) => {
        notify(error.response?.data?.message || "Could not load tables");
      });
  }, []);

  const selected = useMemo(
    () => tables.find((table) => table._id === selectedId) || tables[0],
    [selectedId, tables]
  );

  const handleRegenerate = async () => {
    if (!selected) {
      return;
    }
    try {
      const { data } = await api.post(`/table/${selected._id}/regenerate`);
      const qrCode = data?.qrCode || data?.table?.qrCode;
      if (typeof qrCode === "string") {
        setTables((current) =>
          current.map((table) => (table._id === selected._id ? { ...table, qrCode } : table))
        );
        notify("QR code regenerated", "success");
      }
    } catch (error) {
      notify((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not regenerate the QR code");
    }
  };

  if (configError) {
    return (
      <div>
        <Header title="QR Codes" />
        <p className="rounded-xl bg-alert/10 p-5 font-semibold text-alert-ink" role="alert">
          {configError}. QR codes cannot be generated until it is configured.
        </p>
      </div>
    );
  }

  if (!slug) {
    return (
      <div>
        <Header title="QR Codes" />
        <p className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07]" role="alert">
          Sign in again so we can load your restaurant link.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="print:hidden">
        <Header
          title="QR Codes"
          description="Print one card per table. Regenerate a table's code if its card goes missing."
          actions={
            <Button type="button" variant="ink" onClick={() => setPrintAll(true)} disabled={!tables.length}>
              <Printer aria-hidden="true" />
              Print all QR codes
            </Button>
          }
        />
      </div>

      {tables.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink-soft print:hidden">
          Add a table first. Its QR code appears here.
        </p>
      ) : (
        <div className="grid gap-6 print:hidden lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div>
            <p id="table-picker" className="mb-2 text-sm font-semibold">
              Table
            </p>
            <ul aria-labelledby="table-picker" className="grid grid-cols-4 gap-2 lg:grid-cols-3">
              {tables.map((table) => (
                <li key={table._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(table._id)}
                    aria-pressed={selected?._id === table._id}
                    aria-label={`Select table ${table.tableNumber}`}
                    className={cn(
                      "h-12 w-full rounded-md font-mono text-lg font-bold transition-colors",
                      selected?._id === table._id ? "bg-ink text-paper" : "bg-white ring-1 ring-ink/10 hover:ring-ink/30"
                    )}
                  >
                    {table.tableNumber}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {selected && (
            <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
              <Chit lift="paper" className="w-full max-w-xs" innerClassName="bg-white px-6 pt-6">
                <TentCard table={selected} slug={slug} size={200} />
              </Chit>
              <div className="w-full max-w-sm space-y-3">
                <p className="text-sm font-semibold">Guest link</p>
                <p className="break-all rounded-md bg-white p-3 font-mono text-xs text-ink-soft ring-1 ring-ink/10">
                  {guestUrl(slug, selected.qrCode)}
                </p>
                <Button type="button" variant="outline" className="border-ink/15" onClick={handleRegenerate}>
                  <RefreshCw aria-hidden="true" />
                  Regenerate code
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {printAll && (
        <section className="mt-10 print:mt-0">
          <div className="mb-4 flex items-center justify-between print:hidden">
            <h2 className="text-xl font-bold">All tables</h2>
            <Button type="button" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Print
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 print:grid-cols-2">
            {tables.map((table) => (
              <div key={table._id} className="break-inside-avoid rounded-xl bg-white p-6 ring-1 ring-ink/10">
                <TentCard table={table} slug={slug} size={160} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default QRCodeGenerator;
