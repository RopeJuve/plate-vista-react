import { http, HttpResponse } from "msw";
import { apiPaths, type ApiPath } from "./handlers/paths";
import { server } from "./server";

type Method = "get" | "post" | "put";

/**
 * Replaces one endpoint's answer for the rest of the current test
 * (`setupMsw.ts` resets handlers after each test).
 */
export const mockResponse = (method: Method, path: ApiPath, status: number, body?: unknown) => {
  server.use(
    http[method](apiPaths[path], () =>
      body === undefined ? new HttpResponse(null, { status }) : HttpResponse.json(body, { status })
    )
  );
};

/** e.g. `mockPayResponse(409, { code: "BILL_PAID" })`, or a fixture from `payResponses`. */
export const mockPayResponse = (status: number, body?: unknown) => mockResponse("post", "pay", status, body);

export const mockBillResponse = (status: number, body?: unknown) => mockResponse("get", "bill", status, body);

export const mockCloseResponse = (status: number, body?: unknown) => mockResponse("post", "close", status, body);

export const mockTseResponse = (status: number, body?: unknown) => mockResponse("get", "tse", status, body);

export const mockTseSetupResponse = (status: number, body?: unknown) =>
  mockResponse("post", "tseSetup", status, body);

export const mockLegalResponse = (status: number, body?: unknown) => mockResponse("get", "legal", status, body);

export const mockReceiptResponse = (status: number, body?: unknown) =>
  mockResponse("get", "receipt", status, body);

export const mockCreateCategoryResponse = (status: number, body?: unknown) =>
  mockResponse("post", "categories", status, body);

export const mockUpdateCategoryResponse = (status: number, body?: unknown) =>
  mockResponse("put", "category", status, body);

export const mockStaffBoardResponse = (status: number, body?: unknown) =>
  mockResponse("get", "staffBoard", status, body);
