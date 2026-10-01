import { useCallback, useEffect, useState } from "react";
import type { Table } from "../../../types";
import { apiMessage, notify } from "../../../utils/notify";
import { TABLES_REFRESH_MS } from "../tableList";
import { createTable, fetchTableList } from "../tablesApi";

/**
 * The restaurant's tables for the admin, kept fresh by polling while the tab
 * is visible. Adding reports its own errors and resolves false when nothing was added.
 */
export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [saving, setSaving] = useState(false);

  const loadTables = useCallback(
    () =>
      fetchTableList()
        .then(setTables)
        .catch((error: unknown) => notify(apiMessage(error, "Could not load tables"))),
    []
  );

  useEffect(() => {
    void loadTables();
    const refresh = () => {
      if (document.visibilityState === "visible") {
        void loadTables();
      }
    };
    const timer = setInterval(refresh, TABLES_REFRESH_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadTables]);

  const addTable = async (table: { tableNumber: number; capacity: number }) => {
    setSaving(true);
    try {
      await createTable(table);
      notify("Table added", "success");
      await loadTables();
      return true;
    } catch (error: unknown) {
      notify(apiMessage(error, "Could not add the table"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { tables, saving, addTable };
};
