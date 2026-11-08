import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockCreateCategoryResponse, mockUpdateCategoryResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import Categories from "../../../pages/Categories";

// Radix Select uses pointer capture and scrollIntoView, which jsdom lacks.
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => undefined;
  Element.prototype.scrollIntoView ??= () => undefined;
});

/** Records the JSON body of every request to one endpoint, answering like the default handler would. */
const recordBodies = (method: "post" | "put", path: string, answer: (body: Record<string, unknown>) => unknown) => {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    http[method](path, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      bodies.push(body);
      return HttpResponse.json(answer(body), { status: method === "post" ? 201 : 200 });
    })
  );
  return bodies;
};

const pick = async (user: ReturnType<typeof userEvent.setup>, trigger: string, option: string) => {
  await user.click(screen.getByRole("combobox", { name: trigger }));
  await user.click(await screen.findByRole("option", { name: option }));
};

const renderCategories = async () => {
  const user = userEvent.setup();
  render(<Categories />);
  await screen.findByText("Drinks");
  return user;
};

const newCategory = (body: Record<string, unknown>) => ({ _id: "cat-new", position: 3, ...body });

describe("Categories VAT rate", () => {
  it("shows each category's rate as a badge", async () => {
    await renderCategories();
    const rows = within(screen.getByRole("list", { name: "Categories in menu order" })).getAllByRole("listitem");

    expect(within(rows[0]).getByText("7 %")).toBeInTheDocument();
    expect(within(rows[2]).getByText("19 %")).toBeInTheDocument();
  });

  it("sends the chosen rate when adding a category, defaulting to food on the kitchen", async () => {
    const bodies = recordBodies("post", apiPaths.categories, newCategory);
    const user = await renderCategories();

    expect(screen.getByRole("combobox", { name: "VAT rate for the new category" })).toHaveTextContent("Food, 7 %");
    await user.type(screen.getByLabelText("New category"), "Desserts");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(bodies).toEqual([{ name: "Desserts", station: "kitchen", vatRate: "REDUCED_1" }]));
    expect(await screen.findByText("Desserts")).toBeInTheDocument();
  });

  it("pre-selects 19 % when the station is the bar, until the owner overrides it", async () => {
    const bodies = recordBodies("post", apiPaths.categories, newCategory);
    const user = await renderCategories();

    await pick(user, "Station for the new category", "Bar");
    expect(screen.getByRole("combobox", { name: "VAT rate for the new category" })).toHaveTextContent("Drinks, 19 %");

    await pick(user, "VAT rate for the new category", "Food, 7 %");
    await pick(user, "Station for the new category", "Kitchen");
    await pick(user, "Station for the new category", "Bar");
    expect(screen.getByRole("combobox", { name: "VAT rate for the new category" })).toHaveTextContent("Food, 7 %");

    await user.type(screen.getByLabelText("New category"), "Milkshakes");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(bodies).toEqual([{ name: "Milkshakes", station: "bar", vatRate: "REDUCED_1" }]));
  });

  it("shows a 400 inline under the rate and keeps what the owner typed", async () => {
    mockCreateCategoryResponse(400, { code: "VALIDATION", details: { fields: { vatRate: "Unknown VAT rate" } } });
    const user = await renderCategories();

    await pick(user, "Station for the new category", "Bar");
    await user.type(screen.getByLabelText("New category"), "Wine");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Unknown VAT rate")).toBeInTheDocument();
    expect(screen.getByLabelText("New category")).toHaveValue("Wine");
    expect(screen.getByRole("combobox", { name: "Station for the new category" })).toHaveTextContent("Bar");
    expect(screen.getByRole("combobox", { name: "VAT rate for the new category" })).toHaveTextContent("Drinks, 19 %");
  });

  it("pre-fills a category's rate when editing and sends the change", async () => {
    const bodies = recordBodies("put", apiPaths.category, (body) => ({
      _id: "cat-mains",
      name: "Mains",
      station: "kitchen",
      position: 1,
      vatRate: "REDUCED_1",
      ...body,
    }));
    const user = await renderCategories();

    expect(screen.getByRole("combobox", { name: "VAT rate for Mains" })).toHaveTextContent("Food, 7 %");
    expect(screen.getByRole("combobox", { name: "VAT rate for Drinks" })).toHaveTextContent("Drinks, 19 %");

    await pick(user, "VAT rate for Mains", "Drinks, 19 %");

    await waitFor(() => expect(bodies).toEqual([{ vatRate: "NORMAL" }]));
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "VAT rate for Mains" })).toHaveTextContent("Drinks, 19 %")
    );
  });

  it("shows a 400 on a row's rate inline under that row", async () => {
    mockUpdateCategoryResponse(400, { code: "VALIDATION", details: { fields: { vatRate: "Unknown VAT rate" } } });
    const user = await renderCategories();

    await pick(user, "VAT rate for Mains", "Drinks, 19 %");

    const row = screen.getByRole("combobox", { name: "VAT rate for Mains" }).closest("li") as HTMLElement;
    expect(await within(row).findByText("Unknown VAT rate")).toBeInTheDocument();
  });
});
