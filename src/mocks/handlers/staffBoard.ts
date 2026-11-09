import { http, HttpResponse } from "msw";
import { staffBoard } from "../fixtures/staffBoard";
import { apiPaths } from "./paths";

export const staffBoardHandlers = [http.get(apiPaths.staffBoard, () => HttpResponse.json(staffBoard))];
