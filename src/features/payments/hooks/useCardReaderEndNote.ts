import { useEffect, useRef, useState } from "react";
import type { BillUnfrozenReason } from "../../../shared/realtime/protocol";
import { cardReaderEndedNote } from "../cardReaderAttempt";

/**
 * The note for a card reader payment that ended unpaid. `onReader` is whether the panel shows one in
 * progress; `unfrozenReason` is the last `bill.unfrozen` heard for the bill since it last froze
 * (`null` once it freezes again, which drops the note). Only a payment this panel was showing gets a note,
 * so an online payment opening up again says nothing here.
 */
export const useCardReaderEndNote = (onReader: boolean, unfrozenReason: BillUnfrozenReason | null | undefined) => {
  const [note, setNote] = useState<string | null>(null);
  const wasOnReader = useRef(onReader);

  useEffect(() => {
    if (!unfrozenReason) {
      setNote(null);
      return;
    }
    if (wasOnReader.current) {
      setNote(cardReaderEndedNote(unfrozenReason));
    }
    wasOnReader.current = false;
  }, [unfrozenReason]);

  useEffect(() => {
    if (onReader) {
      wasOnReader.current = true;
    }
  }, [onReader]);

  return note;
};
