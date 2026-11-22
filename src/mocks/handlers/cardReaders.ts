import { http, HttpResponse } from "msw";
import type {
  AddCardReaderBody,
  AddSimulatedReaderBody,
  CardReader,
  CardReaderList,
} from "../../shared/api/payments";
import { cardReaderLists } from "../fixtures/cardReaders";
import { apiPaths } from "./paths";

const MAX_NAME = 40;

const validName = (name: unknown): name is string =>
  typeof name === "string" && name.trim().length > 0 && name.trim().length <= MAX_NAME;

const validation = () => HttpResponse.json({ code: "VALIDATION" }, { status: 400 });

/** A reader as the API answers after registering one now. */
const newReader = (name: string, reader: Partial<CardReader>): CardReader => ({
  id: `reader-${Math.random().toString(36).slice(2, 10)}`,
  name: name.trim(),
  deviceType: "stripe_s700",
  serialNumber: "STRM26138009999",
  status: "online",
  simulated: false,
  busyWith: null,
  addedAt: new Date().toISOString(),
  ...reader,
});

/**
 * By default the server is in test mode with a ready Payout Account and the contract's three readers.
 * The answers do not remember readers added or removed: the section keeps its own list.
 */
export const cardReaderHandlers = [
  http.get(apiPaths.cardReaders, () => HttpResponse.json<CardReaderList>(cardReaderLists.testMode)),
  http.post(apiPaths.cardReaders, async ({ request }) => {
    const body = (await request.json()) as Partial<AddCardReaderBody>;
    if (typeof body?.registrationCode !== "string" || !body.registrationCode.trim() || !validName(body.name)) {
      return validation();
    }
    return HttpResponse.json<CardReader>(newReader(body.name, {}), { status: 201 });
  }),
  http.post(apiPaths.simulatedCardReader, async ({ request }) => {
    const body = (await request.json()) as Partial<AddSimulatedReaderBody>;
    if (!validName(body?.name)) {
      return validation();
    }
    return HttpResponse.json<CardReader>(
      newReader(body.name, { deviceType: "simulated_wisepos_e", serialNumber: "SIMULATED-2", simulated: true }),
      { status: 201 }
    );
  }),
  http.delete(apiPaths.cardReader, () => new HttpResponse(null, { status: 204 })),
];
