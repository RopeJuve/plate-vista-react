import api from "../../services/api";
import type {
  AddCardReaderBody,
  AddSimulatedReaderBody,
  CardReader,
  CardReaderList,
} from "../../shared/api/payments";

const CARD_READERS = "/restaurant/card-readers";

/** `GET /restaurant/card-readers` (owner, admin). The Kasse page shows its own errors. */
export const fetchCardReaders = async () =>
  (await api.get<CardReaderList>(CARD_READERS, { skipErrorToast: true })).data;

/** Registers a reader at Stripe by the code it shows on screen. */
export const addCardReader = async (body: AddCardReaderBody) =>
  (await api.post<CardReader>(CARD_READERS, body, { skipErrorToast: true })).data;

/** Test mode only: a reader Stripe simulates. */
export const addSimulatedReader = async (body: AddSimulatedReaderBody) =>
  (await api.post<CardReader>(`${CARD_READERS}/simulated`, body, { skipErrorToast: true })).data;

/** Removes the reader here and at Stripe. */
export const removeCardReader = async (id: string) => {
  await api.delete(`${CARD_READERS}/${encodeURIComponent(id)}`, { skipErrorToast: true });
};
