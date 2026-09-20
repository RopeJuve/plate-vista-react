import { QRCode } from "react-qrcode";
import { useEffect, useRef, useState } from "react";
import { fetchTables } from "../services/tableDataFetch";
import { notify } from "../utils/notify";
import { RestaurantTable } from "../types";

const getFrontendUrl = () => {
  const frontendUrl = import.meta.env.VITE_PLATE_VISTA_URL;
  if (!frontendUrl) {
    throw new Error("VITE_PLATE_VISTA_URL is not set");
  }
  return frontendUrl.replace(/\/$/, "");
};

const QRCodeGenerator = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [text, setText] = useState("");
  const [configError, setConfigError] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    try {
      getFrontendUrl();
    } catch (error) {
      setConfigError(error.message);
      return;
    }

    fetchTables()
      .then((response) => {
        const tableList = response.data || [];
        setTables(tableList);
        if (tableList[0]) {
          const firstTable = String(tableList[0].tableNumber);
          setSelectedTable(firstTable);
          setText(`${getFrontendUrl()}/table/${firstTable}`);
        }
      })
      .catch((error) => {
        notify(error.response?.data?.message || "Could not load tables");
      });
  }, []);

  const handleChange = (e) => {
    const newTableNum = e.target.value;
    setSelectedTable(newTableNum);
    setText(`${getFrontendUrl()}/table/${newTableNum}`);
  };

  const handleDownload = () => {
    const imgElement = qrRef.current?.querySelector("img");
    if (!imgElement) {
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = imgElement.src;
    downloadLink.download = `table-${selectedTable}-qr-code.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold text-center mb-4">QR Code Generator</h1>
      <div className="flex flex-col items-center max-w-screen-md mx-auto md:flex-row md:items-start">
        <div className="flex-grow">
          <label htmlFor="tableNum" className="block text-lg font-semibold">
            Table Number
          </label>
          <select
            id="tableNum"
            onChange={handleChange}
            value={selectedTable}
            className="block border rounded px-2 py-1"
            aria-label="Select a table"
          >
            {tables.map((table) => (
              <option key={table._id || table.tableNumber} value={table.tableNumber}>
                {table.tableNumber}
              </option>
            ))}
          </select>
        </div>
        {text && (
          <div ref={qrRef} className="mt-4">
            <QRCode value={text} size={250} bgcolor="#ffffff" fgcolor="#000000" />
            <button
              type="button"
              onClick={handleDownload}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
