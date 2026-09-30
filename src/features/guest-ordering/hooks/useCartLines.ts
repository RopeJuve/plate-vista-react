import { useMemo, useState } from "react";
import { addLine, removeLine, setLineNotes, setLineQuantity } from "../cartLines";
import type { CartLine } from "../types";

/** Lines being put together for an order, held in memory. Where they are kept between visits is the caller's business. */
export const useCartLines = (initial: CartLine[] | (() => CartLine[]) = []) => {
  const [lines, setLines] = useState<CartLine[]>(initial);

  const actions = useMemo(
    () => ({
      addLine: (productId: string) => setLines((current) => addLine(current, productId)),
      setQuantity: (productId: string, quantity: number) =>
        setLines((current) => setLineQuantity(current, productId, quantity)),
      setNotes: (productId: string, notes: string) => setLines((current) => setLineNotes(current, productId, notes)),
      removeLine: (productId: string) => setLines((current) => removeLine(current, productId)),
      clearLines: () => setLines([]),
      replaceLines: setLines,
    }),
    []
  );

  return { lines, ...actions };
};
