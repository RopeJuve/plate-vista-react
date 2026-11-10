import api from "../../services/api";
import type {
  FailedSignatureKind,
  FailedSignatureList,
  RetrySignatureResult,
  TseStatus,
} from "../../shared/api/payments";

export const fetchTse = async () => (await api.get<TseStatus>("/tse")).data;

/** The TSE section shows its own error and retry, so the client's generic toast stays off. */
export const setupTse = async () => (await api.post<TseStatus>("/tse/setup", undefined, { skipErrorToast: true })).data;

/** The failed-signatures list shows its own errors. */
export const fetchFailedSignatures = async () =>
  (await api.get<FailedSignatureList>("/tse/failed", { skipErrorToast: true })).data.items;

export const retryFailedSignature = async (kind: FailedSignatureKind, id: string) =>
  (
    await api.post<RetrySignatureResult>(
      `/tse/failed/${kind}/${encodeURIComponent(id)}/retry`,
      undefined,
      { skipErrorToast: true }
    )
  ).data;
