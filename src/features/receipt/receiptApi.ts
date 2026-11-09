import api from "../../services/api";
import type { Receipt } from "../../shared/api/payments";

/** Public: the token in the link is the only key, so no login is needed. The page shows its own errors. */
export const fetchReceipt = async (token: string) =>
  (await api.get<Receipt>(`/receipts/${encodeURIComponent(token)}`, { skipErrorToast: true })).data;
