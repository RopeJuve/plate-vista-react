import { http, HttpResponse } from "msw";
import type { LegalDetails } from "../../shared/api/payments";
import { completeLegalDetails } from "../fixtures/legal";
import { apiPaths } from "./paths";

/** Fields the server requires; a PUT missing any of them answers 400 VALIDATION. */
const missingFields = (body: Partial<LegalDetails>) => {
  const fields: Record<string, string> = {};
  if (!body.legalName?.trim()) fields.legalName = "Required";
  if (!body.address?.street?.trim()) fields["address.street"] = "Required";
  if (!body.address?.zip?.trim()) fields["address.zip"] = "Required";
  if (!body.address?.city?.trim()) fields["address.city"] = "Required";
  return fields;
};

export const legalHandlers = [
  http.get(apiPaths.legal, () => HttpResponse.json(completeLegalDetails)),
  http.put(apiPaths.legal, async ({ request }) => {
    const body = (await request.json()) as Partial<LegalDetails>;
    const fields = missingFields(body);
    if (Object.keys(fields).length) {
      return HttpResponse.json({ code: "VALIDATION", details: { fields } }, { status: 400 });
    }
    return HttpResponse.json(body);
  }),
];
