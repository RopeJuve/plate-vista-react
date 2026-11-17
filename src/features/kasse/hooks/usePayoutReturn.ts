import { useEffect, useRef, useState, type RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { PAYOUT_PARAM, payoutReturn } from "../payoutAccountStage";

/**
 * Handles the owner coming back from Stripe: `?payout=return` scrolls the section into
 * view once its status is read, `?payout=refresh` asks for a fresh link at once.
 * Either way the parameter is removed, so a reload does not repeat it.
 */
export const usePayoutReturn = ({
  section,
  loading,
  startSetup,
}: {
  section: RefObject<HTMLElement>;
  loading: boolean;
  startSetup: () => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  /** Read once: the parameter is gone after the first effect. */
  const [arrival] = useState(() => payoutReturn(searchParams));
  const handled = useRef(false);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!arrival || handled.current) {
      return;
    }
    handled.current = true;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(PAYOUT_PARAM);
        return next;
      },
      { replace: true }
    );
    if (arrival === "REFRESH") {
      startSetup();
    }
  }, [arrival, setSearchParams, startSetup]);

  useEffect(() => {
    if (arrival !== "RETURN" || loading || scrolled.current) {
      return;
    }
    scrolled.current = true;
    section.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [arrival, loading, section]);
};
