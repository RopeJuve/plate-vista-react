import { format } from "date-fns/format";
import { isValid } from "date-fns/isValid";
import { parseISO } from "date-fns/parseISO";

/** Why `POST /tse/setup` did not finish: the legal details are missing, or anything else worth retrying. */
export type TseSetupProblem = "DETAILS_MISSING" | "FAILED";

const errorAnswer = (error: unknown) =>
  (error as { response?: { status?: number; data?: { code?: string } } } | null)?.response;

/** 422 RESTAURANT_DETAILS_MISSING needs the owner; a 502 or a dropped connection can simply be retried. */
export const tseSetupProblem = (error: unknown): TseSetupProblem => {
  const answer = errorAnswer(error);
  return answer?.status === 422 && answer.data?.code === "RESTAURANT_DETAILS_MISSING" ? "DETAILS_MISSING" : "FAILED";
};

/** The activation date as a German reader expects it, e.g. 01.11.2026. */
export const formatTseDate = (iso: string | undefined) => {
  if (!iso) {
    return "";
  }
  const date = parseISO(iso);
  return isValid(date) ? format(date, "dd.MM.yyyy") : "";
};
