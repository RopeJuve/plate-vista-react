import { http, HttpResponse } from "msw";
import type { Category } from "../../features/menu/categoriesApi";
import { categories } from "../fixtures/categories";
import { apiPaths } from "./paths";

/** Creating answers the new category (201); updating merges the change into the fixture. */
export const categoryHandlers = [
  http.get(apiPaths.categories, () => HttpResponse.json(categories)),
  http.post(apiPaths.categories, async ({ request }) => {
    const body = (await request.json()) as Pick<Category, "name" | "station" | "vatRate">;
    const created: Category = { _id: "cat-new", position: categories.length, ...body };
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(apiPaths.category, async ({ params, request }) => {
    const existing = categories.find((category) => category._id === params.id);
    if (!existing) {
      return HttpResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    const body = (await request.json()) as Partial<Category>;
    return HttpResponse.json({ ...existing, ...body });
  }),
];
