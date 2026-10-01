import { useEffect, useMemo, useState } from "react";
import { apiMessage, notify } from "../../../utils/notify";
import { toQrTables, type QrTable } from "../tableList";
import { fetchTableList, regenerateQrCode } from "../tablesApi";

/**
 * Tables that can have a QR card, the one picked for a closer look, and
 * reissuing its code. Loads nothing until `enabled`, so a misconfigured app
 * does not hit the API for cards it cannot print.
 */
export const useQrTables = (enabled: boolean) => {
  const [tables, setTables] = useState<QrTable[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!enabled) {
      return;
    }
    fetchTableList()
      .then((list) => {
        const qrTables = toQrTables(list);
        setTables(qrTables);
        if (qrTables[0]) {
          setSelectedId(qrTables[0]._id);
        }
      })
      .catch((error) => notify(apiMessage(error, "Could not load tables")));
  }, [enabled]);

  const selected = useMemo(
    () => tables.find((table) => table._id === selectedId) || tables[0],
    [selectedId, tables]
  );

  const regenerate = async () => {
    if (!selected) {
      return;
    }
    try {
      const qrCode = await regenerateQrCode(selected._id);
      if (qrCode) {
        setTables((current) => current.map((table) => (table._id === selected._id ? { ...table, qrCode } : table)));
        notify("QR code regenerated", "success");
      }
    } catch (error) {
      notify(apiMessage(error, "Could not regenerate the QR code"));
    }
  };

  return { tables, selected, setSelectedId, regenerate };
};
