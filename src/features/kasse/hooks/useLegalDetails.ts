import { useEffect, useState } from "react";
import type { LegalDetailsValues } from "../../../lib/schemas";
import type { LegalDetails } from "../../../shared/api/payments";
import { apiMessage, notify } from "../../../utils/notify";
import { isLegalComplete, legalFieldErrors, toLegalDetails, type LegalFieldError } from "../legalDetails";
import { fetchLegalDetails, saveLegalDetails } from "../legalDetailsApi";

/**
 * The restaurant's legal details for receipts and the TSE. `complete` tells
 * later sections (TSE activation) whether they can go ahead.
 */
export const useLegalDetails = () => {
  const [details, setDetails] = useState<LegalDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLegalDetails()
      .then((loaded) => {
        if (!cancelled) {
          setDetails(loaded);
        }
      })
      .catch((error) => notify(apiMessage(error, "Could not load the legal details")))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Resolves to the field errors to show, or an empty list once saved. */
  const save = async (values: LegalDetailsValues): Promise<LegalFieldError[]> => {
    try {
      setDetails(await saveLegalDetails(toLegalDetails(values)));
      notify("Saved", "success");
      return [];
    } catch (error) {
      const errors = legalFieldErrors(error);
      if (errors.length === 0) {
        notify(apiMessage(error, "Could not save the legal details"));
      }
      return errors;
    }
  };

  return { details, loading, complete: isLegalComplete(details), save };
};

export type LegalDetailsState = ReturnType<typeof useLegalDetails>;
