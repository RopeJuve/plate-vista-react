import { useCallback, useEffect, useRef, useState } from "react";
import type { AddCardReaderBody, CardReader, CardReaderList } from "../../../shared/api/payments";
import { cardReaderErrorMessage, readerGone, stripeNotConfigured, withoutReader, withReader } from "../cardReaders";
import { addCardReader, addSimulatedReader, fetchCardReaders, removeCardReader } from "../cardReadersApi";

/**
 * The restaurant's Card Readers. `add`, `addSimulated` and `remove` resolve `null` on success
 * and the sentence to show otherwise, so the dialogs never need a try/catch.
 */
export const useCardReaders = () => {
  const [list, setList] = useState<CardReaderList | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const loaded = await fetchCardReaders();
      if (mounted.current) {
        setList(loaded);
      }
    } catch (error) {
      if (mounted.current) {
        setUnavailable(stripeNotConfigured(error));
        setLoadFailed(!stripeNotConfigured(error));
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const changeItems = (change: (items: CardReader[]) => CardReader[]) =>
    setList((current) => (current ? { ...current, items: change(current.items) } : current));

  const settleAdd = async (adding: Promise<CardReader>) => {
    try {
      const reader = await adding;
      changeItems((items) => withReader(items, reader));
      return null;
    } catch (error) {
      return cardReaderErrorMessage(error);
    }
  };

  const add = (body: AddCardReaderBody) => settleAdd(addCardReader(body));

  const addSimulated = (name: string) => settleAdd(addSimulatedReader({ name }));

  const remove = async (id: string) => {
    try {
      await removeCardReader(id);
    } catch (error) {
      if (!readerGone(error)) {
        return cardReaderErrorMessage(error);
      }
    }
    changeItems((items) => withoutReader(items, id));
    return null;
  };

  return {
    readers: list?.items ?? [],
    testMode: Boolean(list?.testMode),
    payoutAccountReady: Boolean(list?.payoutAccountReady),
    loaded: list !== null,
    loading,
    loadFailed,
    unavailable,
    reload: load,
    add,
    addSimulated,
    remove,
  };
};

export type CardReadersState = ReturnType<typeof useCardReaders>;
