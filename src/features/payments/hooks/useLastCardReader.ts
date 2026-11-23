import { useCallback, useState } from "react";

const STORAGE_KEY = "plateVista.lastCardReaderId";

/** The reader id this device used last, or `null` when there is none or storage can't be read. */
const readLastReaderId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * The card reader this device started a payment on last, kept in browser storage so the
 * pay panel can preselect it. Without storage (private window, blocked site data) it is
 * remembered only while the panel is open.
 */
export const useLastCardReader = () => {
  const [lastReaderId, setLastReaderId] = useState(readLastReaderId);

  const remember = useCallback((readerId: string) => {
    setLastReaderId(readerId);
    try {
      localStorage.setItem(STORAGE_KEY, readerId);
    } catch {
      // Storage is unavailable: the choice lasts as long as this panel.
    }
  }, []);

  return { lastReaderId, remember };
};
