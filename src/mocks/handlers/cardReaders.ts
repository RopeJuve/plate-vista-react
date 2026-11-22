import { http, HttpResponse } from "msw";
import type { CardReaderPayment, StartCardReaderPaymentBody } from "../../shared/api/payments";
import { cardReaderPaymentInProgress, cardReaders } from "../fixtures/cardReaders";
import { apiPaths } from "./paths";

const readerById = (id: string) => Object.values(cardReaders).find((reader) => reader.id === id);

/**
 * Starting a card reader payment works on any known reader, and a test card is always taken;
 * what follows (paid, declined) only arrives as realtime events, which tests emit themselves.
 */
export const cardReaderHandlers = [
  http.post(apiPaths.cardReaderPayment, async ({ params, request }) => {
    const body = (await request.json()) as Partial<StartCardReaderPaymentBody>;
    const reader = readerById(String(body?.readerId));
    if (!reader) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json<CardReaderPayment>({
      ...cardReaderPaymentInProgress(reader),
      sessionId: String(params.sessionId),
      amountCents: Number(body.expectedTotalCents),
    });
  }),
  http.post(apiPaths.cardReaderTestCard, ({ params }) =>
    HttpResponse.json<CardReaderPayment>({
      ...cardReaderPaymentInProgress(cardReaders.simulated),
      sessionId: String(params.sessionId),
    })
  ),
];
