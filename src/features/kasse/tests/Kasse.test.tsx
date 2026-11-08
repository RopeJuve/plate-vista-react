import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import ToastProvider from "../../../Components/ToastProvider";
import { emptyLegalDetails } from "../../../mocks/fixtures/legal";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockLegalResponse, mockResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import Kasse from "../../../pages/Kasse";

const recordPuts = () => {
  const bodies: unknown[] = [];
  server.use(
    http.put(apiPaths.legal, async ({ request }) => {
      const body = await request.json();
      bodies.push(body);
      return HttpResponse.json(body);
    })
  );
  return bodies;
};

const renderKasse = () => {
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <Kasse />
    </ToastProvider>
  );
  return user;
};

const field = (name: string) => screen.getByLabelText(name);

const fillRequired = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(field("Legal name"), "Plate Vista Gastro GmbH");
  await user.type(field("Street and number"), "Hauptstraße 1");
  await user.type(field("ZIP"), "10115");
  await user.type(field("City"), "Berlin");
};

describe("Kasse legal details", () => {
  it("pre-fills the form with saved details", async () => {
    renderKasse();

    expect(await screen.findByDisplayValue("Plate Vista Gastro GmbH")).toBeInTheDocument();
    expect(field("Street and number")).toHaveValue("Hauptstraße 1");
    expect(field("ZIP")).toHaveValue("10115");
    expect(field("City")).toHaveValue("Berlin");
    expect(field("Tax number")).toHaveValue("30/123/45678");
    expect(field("VAT ID")).toHaveValue("DE123456789");
    expect(screen.getByText("Germany")).toBeInTheDocument();
  });

  it("renders an empty form when nothing is saved yet", async () => {
    mockLegalResponse(200, emptyLegalDetails);
    renderKasse();

    await waitFor(() => expect(field("Legal name")).toBeEnabled());
    for (const name of ["Legal name", "Street and number", "ZIP", "City", "Tax number", "VAT ID"]) {
      expect(field(name)).toHaveValue("");
    }
  });

  it("blocks a submit without tax number and VAT ID and sends nothing", async () => {
    mockLegalResponse(200, emptyLegalDetails);
    const bodies = recordPuts();
    const user = renderKasse();
    await waitFor(() => expect(field("Legal name")).toBeEnabled());

    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Save legal details" }));

    expect(await screen.findByText("Enter a tax number or a VAT ID")).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it("requires the address and a 5-digit ZIP", async () => {
    mockLegalResponse(200, emptyLegalDetails);
    const bodies = recordPuts();
    const user = renderKasse();
    await waitFor(() => expect(field("Legal name")).toBeEnabled());

    await user.type(field("ZIP"), "1011");
    await user.click(screen.getByRole("button", { name: "Save legal details" }));

    expect(await screen.findByText("Legal name is required")).toBeInTheDocument();
    expect(screen.getByText("Street is required")).toBeInTheDocument();
    expect(screen.getByText("ZIP must be 5 digits")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it("sends the exact legal details and says Saved", async () => {
    mockLegalResponse(200, emptyLegalDetails);
    const bodies = recordPuts();
    const user = renderKasse();
    await waitFor(() => expect(field("Legal name")).toBeEnabled());

    await fillRequired(user);
    await user.type(field("Tax number"), "30/123/45678");
    await user.click(screen.getByRole("button", { name: "Save legal details" }));

    await waitFor(() =>
      expect(bodies).toEqual([
        {
          legalName: "Plate Vista Gastro GmbH",
          address: { street: "Hauptstraße 1", zip: "10115", city: "Berlin", country: "DE" },
          taxNumber: "30/123/45678",
        },
      ])
    );
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("shows a server 400 under the matching fields", async () => {
    mockResponse("put", "legal", 400, {
      code: "VALIDATION",
      details: { fields: { "address.zip": "Unknown ZIP", vatId: "Not a German VAT ID" } },
    });
    const user = renderKasse();
    await screen.findByDisplayValue("Plate Vista Gastro GmbH");

    await user.click(screen.getByRole("button", { name: "Save legal details" }));

    expect(await screen.findByText("Unknown ZIP")).toBeInTheDocument();
    expect(screen.getByText("Not a German VAT ID")).toBeInTheDocument();
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });
});
