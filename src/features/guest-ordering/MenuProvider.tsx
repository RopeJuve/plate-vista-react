import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import api from "../../services/api";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { applyMenuUpdate, toMenuRecord, unwrapList, type MenuRecord } from "./menu";

type MenuContextValue = {
  items: MenuRecord[];
  itemsById: Record<string, MenuRecord>;
  categories: string[];
  loading: boolean;
  error: string;
  reload: () => void;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export const MenuProvider = ({ slug, children }: { slug?: string; children?: ReactNode }) => {
  const { subscribe } = useRealtime();
  const [items, setItems] = useState<MenuRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const path = slug ? `/r/${encodeURIComponent(slug)}/menu-items` : "/menu-items";
        const { data } = await api.get(path, { signal: controller.signal });
        setItems(unwrapList(data).map(toMenuRecord).filter((item): item is MenuRecord => Boolean(item)));
      } catch (err) {
        if ((err as { code?: string }).code === "ERR_CANCELED") {
          return;
        }
        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Could not load the menu");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [slug, reloadCount]);

  useEffect(() => {
    return subscribe("menu.updated", (data) => {
      setItems((current) => applyMenuUpdate(current, data));
    });
  }, [subscribe]);

  const itemsById = useMemo(
    () => Object.fromEntries(items.map((item) => [item._id, item])),
    [items]
  );

  const categories = useMemo(
    () => [...new Set(items.filter((item) => !item.archived).map((item) => item.category).filter(Boolean))],
    [items]
  );

  const value = useMemo<MenuContextValue>(
    () => ({
      items,
      itemsById,
      categories,
      loading,
      error,
      reload: () => setReloadCount((count) => count + 1),
    }),
    [items, itemsById, categories, loading, error]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return context;
};
