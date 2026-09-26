import { QRCode } from "react-qrcode";
import { useEffect, useMemo, useState } from "react";
import { fetchTables } from "../services/tableDataFetch";
import api, { getAuthToken } from "../services/api";
import { notify } from "../utils/notify";
import { decodeJwt } from "../shared/api/jwt";

type QrTable = {
  _id: string;
  tableNumber: number;
  qrCode: string;
};

const getFrontendUrl = () => String(import.meta.env.VITE_PLATE_VISTA_URL || "").replace(/\/$/, "");

const guestUrl = (slug: string, qrCode: string) => `${getFrontendUrl()}/r/${slug}/t/${qrCode}`;

const QRCodeGenerator = () => {
  const [tables, setTables] = useState<QrTable[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [slug, setSlug] = useState(() => localStorage.getItem("restaurantSlug") || "");
  const [configError, setConfigError] = useState("");
  const [printAll, setPrintAll] = useState(false);

  useEffect(() => {
    if (!getFrontendUrl()) {
      setConfigError("VITE_PLATE_VISTA_URL is not set");
      return;
    }

    const token = getAuthToken();
    if (token) {
      const payload = decodeJwt(token);
      const fromToken = payload.slug || payload.restaurantSlug;
      if (typeof fromToken === "string" && fromToken) {
        setSlug(fromToken);
        localStorage.setItem("restaurantSlug", fromToken);
      }
    }

    api
      .get("/auth/user")
      .then(({ data }) => {
        const nextSlug =
          data?.restaurant?.slug || data?.user?.restaurant?.slug || data?.slug || data?.user?.slug;
        if (typeof nextSlug === "string" && nextSlug) {
          setSlug(nextSlug);
          localStorage.setItem("restaurantSlug", nextSlug);
        }
      })
      .catch(() => undefined);

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
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-lg font-semibold text-red-600" role="alert">
          {configError}. QR codes cannot be generated until it is configured.
        </p>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="p-8 text-center">
        <p role="alert">Sign in again so we can load your restaurant link.</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h1 className="mb-4 text-center text-2xl font-bold">QR Code Generator</h1>
      <div className="mx-auto flex max-w-screen-md flex-col items-center md:flex-row md:items-start">
        <div className="flex-grow">
          <label htmlFor="tableNum" className="block text-lg font-semibold">
            Table
          </label>
          <select
            id="tableNum"
            onChange={(event) => setSelectedId(event.target.value)}
            value={selected?._id || ""}
            className="block rounded border px-2 py-1"
            aria-label="Select a table"
          >
            {tables.map((table) => (
              <option key={table._id} value={table._id}>
                Table {table.tableNumber}
              </option>
            ))}
          </select>
          <div className="mt-4 flex gap-2">
            <button type="button" className="rounded bg-gray-800 px-4 py-2 text-white" onClick={() => setPrintAll(true)}>
              Print all QR codes
            </button>
            <button type="button" className="rounded bg-orange-500 px-4 py-2 text-white" onClick={handleRegenerate}>
              Regenerate code
            </button>
          </div>
        </div>
        {selected && (
          <div className="mt-4">
            <QRCode value={guestUrl(slug, selected.qrCode)} size={250} bgcolor="#ffffff" fgcolor="#000000" />
            <p className="mt-2 max-w-xs break-all text-center text-xs text-gray-500">
              {guestUrl(slug, selected.qrCode)}
            </p>
          </div>
        )}
      </div>
      {printAll && (
        <div className="mt-8 bg-white p-6 text-black print:mt-0">
          <div className="mb-4 flex justify-between print:hidden">
            <h2 className="text-xl font-semibold">All tables</h2>
            <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => window.print()}>
              Print
            </button>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {tables.map((table) => (
              <div key={table._id} className="flex flex-col items-center break-inside-avoid">
                <p className="mb-2 text-lg font-semibold">Table {table.tableNumber}</p>
                <QRCode value={guestUrl(slug, table.qrCode)} size={180} bgcolor="#ffffff" fgcolor="#000000" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
