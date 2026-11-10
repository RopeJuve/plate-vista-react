import { useEffect, useState } from "react";
import api from "../../../services/api";
import type { TseStatus } from "../../../shared/api/payments";
import { onFailedSignatures } from "../failedSignatureCount";

/**
 * How many payments and orders wait for a TSE signature, for the admin nav.
 * Loads `GET /tse` once and then follows what the Kasse page announces. A failed
 * load just shows no count: the Kasse page itself explains the problem.
 */
export const useFailedSignatureCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const stop = onFailedSignatures((next) => setCount(next));
    api
      .get<TseStatus>("/tse", { skipErrorToast: true })
      .then(({ data }) => {
        if (mounted) {
          setCount(data.active ? data.failedSignatures : 0);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      stop();
    };
  }, []);

  return { count };
};
