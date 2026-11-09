import api from "../../services/api";
import type { TseStatus } from "../../shared/api/payments";

export const fetchTse = async () => (await api.get<TseStatus>("/tse")).data;

/** The TSE section shows its own error and retry, so the client's generic toast stays off. */
export const setupTse = async () => (await api.post<TseStatus>("/tse/setup", undefined, { skipErrorToast: true })).data;
