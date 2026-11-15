import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import ToastProvider from "../../../Components/ToastProvider";
import { emptyProfile } from "../../../mocks/fixtures/profile";
import { apiPaths } from "../../../mocks/handlers/paths";
import { server } from "../../../mocks/server";
import RestaurantProfile from "../../../pages/RestaurantProfile";

const recordPuts = (answer?: (body: unknown) => Response) => {
  const bodies: unknown[] = [];
  server.use(
    http.put(apiPaths.profile, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      bodies.push(body);
      return answer ? answer(body) : HttpResponse.json({ ...emptyProfile, ...body, usesLegalAddress: !body.address });
    })
  );
  return bodies;
};

const renderPage = () => {
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <RestaurantProfile />
    </ToastProvider>
  );
  return user;
};

/** Unticking the legal address pre-fills it, so each field is replaced, not appended to. */
const replace = async (user: ReturnType<typeof userEvent.setup>, label: string, text: string) => {
  await user.clear(screen.getByLabelText(label));
  await user.type(screen.getByLabelText(label), text);
};

const save = () => screen.getByRole("button", { name: "Save restaurant profile" });

describe("Restaurant profile page", () => {
  it("starts on the legal address with every day closed", async () => {
    const user = renderPage();
    expect(await screen.findByText("Hauptstraße 1, 10115 Berlin")).toBeInTheDocument();
    expect(screen.getByLabelText("Use the legal address")).toBeChecked();
    expect(screen.getAllByText("Closed")).toHaveLength(7);

    await user.click(screen.getByLabelText("Use the legal address"));
    expect(screen.getByLabelText("Street and number")).toHaveValue("Hauptstraße 1");
  });

  it("saves an own address and opening hours, past midnight included", async () => {
    const bodies = recordPuts();
    const user = renderPage();

    await user.click(await screen.findByLabelText("Use the legal address"));
    await replace(user, "Street and number", "Neben dem Mühlweg 26");
    await replace(user, "ZIP", "65474");
    await replace(user, "City", "Bischofsheim");
    await user.click(screen.getByRole("button", { name: "Add opening time on Friday" }));
    const closes = screen.getByLabelText("Friday closes");
    await user.clear(closes);
    await user.type(closes, "02:00");
    await user.click(save());

    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toMatchObject({
      logoUrl: null,
      address: { street: "Neben dem Mühlweg 26", zip: "65474", city: "Bischofsheim" },
      openingHours: { fri: [{ open: "11:00", close: "02:00" }], mon: [] },
    });
  });

  it("refuses overlapping times before sending anything", async () => {
    const bodies = recordPuts();
    const user = renderPage();

    const add = await screen.findByRole("button", { name: "Add opening time on Tuesday" });
    await user.click(add);
    await user.click(screen.getByRole("button", { name: "Add opening time on Tuesday" }));
    await user.click(save());

    expect(await screen.findByText("Opening times overlap")).toBeInTheDocument();
    expect(bodies).toHaveLength(0);
  });

  it("allows at most three opening times a day", async () => {
    const user = renderPage();
    for (let i = 0; i < 3; i += 1) {
      await user.click(await screen.findByRole("button", { name: "Add opening time on Monday" }));
    }
    expect(screen.queryByRole("button", { name: "Add opening time on Monday" })).not.toBeInTheDocument();
  });

  it("shows the server's field errors under the fields", async () => {
    recordPuts(() =>
      HttpResponse.json(
        { code: "VALIDATION", details: { fields: { "address.zip": "Unknown ZIP" } } },
        { status: 400 }
      )
    );
    const user = renderPage();
    await user.click(await screen.findByLabelText("Use the legal address"));
    await replace(user, "Street and number", "Weg 1");
    await replace(user, "ZIP", "99999");
    await replace(user, "City", "Nowhere");
    await user.click(save());

    expect(await screen.findByText("Unknown ZIP")).toBeInTheDocument();
  });
});
