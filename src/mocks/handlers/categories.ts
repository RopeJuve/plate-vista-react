import { http, HttpResponse } from "msw";
import { categories } from "../fixtures/categories";
import { apiPaths } from "./paths";

export const categoryHandlers = [http.get(apiPaths.categories, () => HttpResponse.json(categories))];
