import api from "../../services/api";
import type { LegalDetails } from "../../shared/api/payments";

export const fetchLegalDetails = async () => (await api.get<LegalDetails>("/restaurant/legal")).data;

/** Errors are shown under the fields, so the client's generic toast stays off. */
export const saveLegalDetails = async (details: LegalDetails) =>
  (await api.put<LegalDetails>("/restaurant/legal", details, { skipErrorToast: true })).data;
