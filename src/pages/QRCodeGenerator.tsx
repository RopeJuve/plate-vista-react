import { useState } from "react";
import { Printer, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../Components/AdminComponents";
import { Chit } from "../Components/rail";
import { guestAppBaseUrl, guestTableUrl } from "../features/tables/guestLink";
import { useQrTables } from "../features/tables/hooks/useQrTables";
import QrTablePicker from "../features/tables/QrTablePicker";
import TentCard from "../features/tables/TentCard";
import { Button } from "@/components/ui/button";

const AdminNotice = ({ children, tone }: { children: string; tone: "alert" | "plain" }) => (
  <div>
    <Header title="QR Codes" />
    <p
      className={tone === "alert" ? "rounded-xl bg-alert/10 p-5 font-semibold text-alert-ink" : "rounded-xl bg-white p-5 ring-1 ring-ink/[0.07]"}
      role="alert"
    >
      {children}
    </p>
  </div>
);

/** One printable QR card per table, and a way to reissue a lost one. */
const QRCodeGenerator = () => {
  const baseUrl = guestAppBaseUrl();
  const slug = useAuth().restaurantSlug || "";
  const { tables, selected, setSelectedId, regenerate } = useQrTables(Boolean(baseUrl));
  const [printAll, setPrintAll] = useState(false);
  const urlFor = (qrCode: string) => guestTableUrl(baseUrl, slug, qrCode);

  if (!baseUrl) {
    return (
      <AdminNotice tone="alert">
        VITE_PLATE_VISTA_URL is not set. QR codes cannot be generated until it is configured.
      </AdminNotice>
    );
  }

  if (!slug) {
    return <AdminNotice tone="plain">Sign in again so we can load your restaurant link.</AdminNotice>;
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
          <QrTablePicker tables={tables} selectedId={selected?._id} onSelect={setSelectedId} />
          {selected && (
            <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
              <Chit lift="paper" className="w-full max-w-xs" innerClassName="bg-white px-6 pt-6">
                <TentCard table={selected} url={urlFor(selected.qrCode)} size={200} />
              </Chit>
              <div className="w-full max-w-sm space-y-3">
                <p className="text-sm font-semibold">Guest link</p>
                <p className="break-all rounded-md bg-white p-3 font-mono text-xs text-ink-soft ring-1 ring-ink/10">
                  {urlFor(selected.qrCode)}
                </p>
                <Button type="button" variant="outline" className="border-ink/15" onClick={regenerate}>
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
                <TentCard table={table} url={urlFor(table.qrCode)} size={160} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default QRCodeGenerator;
