import { http, HttpResponse } from "msw";
import { receiptsByToken } from "../fixtures/receipts";
import { apiPaths } from "./paths";

export const receiptHandlers = [
  http.get(apiPaths.receipt, ({ params }) => {
    const receipt = receiptsByToken[String(params.token)];
    return receipt
      ? HttpResponse.json(receipt)
      : HttpResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }),
];
