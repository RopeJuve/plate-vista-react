import { fireEvent, render, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import {
  BARE_CARD_READER_RECEIPT_TOKEN,
  CARD_READER_RECEIPT_TOKEN,
  FAILED_RECEIPT_TOKEN,
  MISSING_RECEIPT_TOKEN,
  ONLINE_RECEIPT_TOKEN,
  PAYPAL_RECEIPT_TOKEN,
  PENDING_RECEIPT_TOKEN,
  SIGNED_RECEIPT_TOKEN,
  signedReceipt,
} from "../../../mocks/fixtures/receipts";
import { apiPaths } from "../../../mocks/handlers/paths";
import { mockReceiptResponse } from "../../../mocks/overrides";
import { server } from "../../../mocks/server";
import { formatCents } from "../../../shared/money/formatCents";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import ReceiptPage from "../ReceiptPage";
import { qrCodeImageSrc } from "../receiptQrCode";

const renderReceipt = (token: string) => {
  const realtime = createMockRealtime();
  render(
    <RealtimeTestProviders realtime={realtime} path={`/receipt/${token}`}>
      <Routes>
        <Route path="/receipt/:receiptToken" element={<ReceiptPage />} />
      </Routes>
    </RealtimeTestProviders>
  );
  return realtime;
};

/** `toHaveTextContent` collapses the no-break space `formatCents` puts before the €. */
const shown = (cents: number) => formatCents(cents).replace(/\s/g, " ");

const tseBlock = () => screen.queryByRole("region", { name: "TSE-Signatur" });

describe("ReceiptPage", () => {
  it("shows the restaurant, the Beleg block, the lines and the payment method", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    expect(await screen.findByRole("heading", { name: "Plate Vista" })).toBeInTheDocument();
    expect(screen.getByText(signedReceipt.restaurant.legalName)).toBeInTheDocument();
    const { street, zip, city } = signedReceipt.restaurant.address;
    expect(screen.getByText(street)).toBeInTheDocument();
    expect(screen.getByText(`${zip} ${city}`)).toBeInTheDocument();
    expect(screen.getByText(`Steuernummer: ${signedReceipt.restaurant.taxNumber}`)).toBeInTheDocument();
    expect(screen.getByText(`USt-IdNr.: ${signedReceipt.restaurant.vatId}`)).toBeInTheDocument();

    expect(screen.getByText("Summe").closest("div")).toHaveTextContent(shown(2050));
    expect(screen.getByText("Zahlungsart").closest("div")).toHaveTextContent("Karte");
    expect(screen.getByText("Danke für Ihren Besuch!")).toBeInTheDocument();
  });

  it("shows the Receipt Number, date, table and Service Period", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const meta = within(await screen.findByLabelText("Belegdaten"));
    const value = (label: string) => meta.getByText(label).nextElementSibling;
    expect(screen.getByRole("heading", { name: "Beleg" })).toBeInTheDocument();
    expect(value("Beleg-Nr")).toHaveTextContent("1042");
    expect(value("Datum")).toHaveTextContent("07.11.2026, 20:30:00");
    expect(value("Tisch")).toHaveTextContent("12");
    expect(value("Leistungszeitraum")).toHaveTextContent("07.11.2026, 19:05:12 – 07.11.2026, 20:30:00");
  });

  it("says the Receipt Number follows while the payment is not signed", async () => {
    renderReceipt(PENDING_RECEIPT_TOKEN);

    const meta = within(await screen.findByLabelText("Belegdaten"));
    expect(meta.getByText("Beleg-Nr").nextElementSibling).toHaveTextContent("wird nachgereicht");
  });

  it("lists the positions as a numbered table with quantity, unit price, total and VAT letter", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const table = await screen.findByRole("table", { name: "Positionen" });
    const rows = within(table).getAllByRole("row");
    expect(within(rows[0]).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Nr",
      "Bezeichnung",
      "Menge",
      "Preis",
      "Gesamt",
      "St",
    ]);
    const cells = (row: HTMLElement) => within(row).getAllByRole("cell").map((cell) => cell.textContent);
    expect(cells(rows[1])).toEqual(["1", "Tomato soup", "2", formatCents(650), formatCents(1300), "B"]);
    expect(cells(rows[2])).toEqual(["2", "House red", "1", formatCents(750), formatCents(750), "A"]);
  });

  it("prints one VAT row per rate from totalsByVat", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const table = await screen.findByRole("table", { name: "Mehrwertsteuer" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(signedReceipt.totalsByVat.length);
    expect(within(rows[0]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "B 7 %",
      formatCents(1215),
      formatCents(85),
      formatCents(1300),
    ]);
    expect(within(rows[1]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "A 19 %",
      formatCents(630),
      formatCents(120),
      formatCents(750),
    ]);
  });

  it("shows the TSE block of a signed receipt", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    await screen.findByRole("heading", { name: "Plate Vista" });
    const block = within(tseBlock()!);
    const value = (label: string) => block.getByText(label).nextElementSibling;
    expect(value("Transaktionsnummer")).toHaveTextContent("1042");
    expect(value("Start")).toHaveTextContent("07.11.2026, 20:30:00");
    expect(value("Ende")).toHaveTextContent("07.11.2026, 20:30:01");
    expect(value("Signaturzähler")).toHaveTextContent("2084");
    expect(value("Signatur")).toHaveTextContent("MEUCIQDexampleSignatureValue==");
    expect(value("Signatur")).toHaveClass("font-mono", "break-all");
    expect(value("TSE-Seriennummer")).toHaveTextContent("tss-serial-0001");
    expect(value("Kassen-Seriennummer")).toHaveTextContent("client-0001");
    expect(screen.queryByText("Signatur wird erstellt…")).not.toBeInTheDocument();
  });

  it("renders the QR code from qrCodeData", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const qr = await screen.findByRole("img", { name: "QR-Code der TSE-Signatur" });
    expect(qr).toHaveAttribute("src", await qrCodeImageSrc(signedReceipt.signature.qrCodeData!));
    expect(qr.getAttribute("src")).not.toBe(await qrCodeImageSrc("something else"));
  });

  it("shows a pending receipt without the TSE block", async () => {
    renderReceipt(PENDING_RECEIPT_TOKEN);

    expect(await screen.findByText("Signatur wird erstellt…")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Plate Vista" })).toBeInTheDocument();
    expect(tseBlock()).not.toBeInTheDocument();
  });

  it("says the signature will follow when signing failed", async () => {
    renderReceipt(FAILED_RECEIPT_TOKEN);

    expect(await screen.findByText("TSE-Signatur wird nachgereicht")).toBeInTheDocument();
    expect(screen.getByText("Summe").closest("div")).toHaveTextContent(shown(2050));
    expect(tseBlock()).not.toBeInTheDocument();
  });

  it("shows how an online card payment was made, as Stripe saw it", async () => {
    renderReceipt(ONLINE_RECEIPT_TOKEN);

    const section = within(await screen.findByRole("region", { name: "Zahlungsmittel" }));
    expect(section.getByText("Zahlungsart").closest("div")).toHaveTextContent("Online");
    expect(section.getByText("VISA")).toBeInTheDocument();
    expect(section.getByText("•••• 4242")).toBeInTheDocument();
    expect(section.getByText("via Apple Pay")).toBeInTheDocument();
    const value = (label: string) => section.getByText(label).nextElementSibling;
    expect(value("Kartentyp")).toHaveTextContent("Debit");
    expect(value("Zeit")).toHaveTextContent("07.11.2026, 20:29:58");
    expect(value("Transaktions-ID")).toHaveTextContent("pi_3QxExample0001");
    expect(value("Autorisierungscode")).toHaveTextContent("831000");
  });

  it("labels a card reader payment Karte and shows every card detail", async () => {
    renderReceipt(CARD_READER_RECEIPT_TOKEN);

    const section = within(await screen.findByRole("region", { name: "Zahlungsmittel" }));
    expect(section.getByText("Zahlungsart").closest("div")).toHaveTextContent("Karte");
    expect(section.getByText("VISA")).toBeInTheDocument();
    expect(section.getByText("•••• 4242")).toBeInTheDocument();
    const value = (label: string) => section.getByText(label).nextElementSibling;
    expect(value("Kartentyp")).toHaveTextContent("Kredit");
    expect(value("Autorisierungscode")).toHaveTextContent("123456");
    expect(value("AID")).toHaveTextContent("A0000000031010");
    expect(value("Anwendung")).toHaveTextContent("VISA CREDIT");
    expect(value("Lesemodus")).toHaveTextContent("Kontaktlos");
    expect(value("Zeit")).toHaveTextContent("07.11.2026, 20:29:55");
    expect(value("Transaktions-ID")).toHaveTextContent("pi_3QaBcDeFgHiJkLmN0aBcDeFg");
  });

  it("labels a card reader payment without details Karte, with no card lines", async () => {
    renderReceipt(BARE_CARD_READER_RECEIPT_TOKEN);

    const section = within(await screen.findByRole("region", { name: "Zahlungsmittel" }));
    expect(section.getByText("Zahlungsart").closest("div")).toHaveTextContent("Karte");
    expect(section.queryByLabelText("Zahlungsdetails")).not.toBeInTheDocument();
    expect(section.queryByText("VISA")).not.toBeInTheDocument();
  });

  it("shows a payment that was not by card by its name, without card fields", async () => {
    renderReceipt(PAYPAL_RECEIPT_TOKEN);

    const section = within(await screen.findByRole("region", { name: "Zahlungsmittel" }));
    expect(section.getByText("PayPal")).toBeInTheDocument();
    expect(section.getByText("Transaktions-ID").nextElementSibling).toHaveTextContent("pi_3QxExample0002");
    expect(section.queryByText("Kartentyp")).not.toBeInTheDocument();
    expect(section.queryByText("Autorisierungscode")).not.toBeInTheDocument();
  });

  it("shows only the method for a payment without details", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const section = within(await screen.findByRole("region", { name: "Zahlungsmittel" }));
    expect(section.queryByLabelText("Zahlungsdetails")).not.toBeInTheDocument();
  });

  it("folds the payment section away on screen but keeps it in print", async () => {
    renderReceipt(ONLINE_RECEIPT_TOKEN);

    const toggle = await screen.findByRole("button", { name: "Zahlungsmittel" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const body = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(body).toHaveClass("hidden", "print:block");
  });

  it("has a blank Hospitality Section, folded on screen until opened and always printed", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const toggle = await screen.findByRole("button", { name: "Bewirtungsinformationen" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const body = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(body).toHaveClass("hidden", "print:block");
    fireEvent.click(toggle);
    expect(body).not.toHaveClass("hidden");
    for (const label of ["Bewirtete Personen", "Anlass der Bewirtung", "Ort, Datum", "Unterschrift"]) {
      expect(within(body).getByText(label)).toBeInTheDocument();
    }
  });

  it("says the receipt was not found on a 404", async () => {
    renderReceipt(MISSING_RECEIPT_TOKEN);

    expect(await screen.findByRole("heading", { name: "Beleg nicht gefunden" })).toBeInTheDocument();
  });

  it("says the receipt could not be loaded on any other error", async () => {
    mockReceiptResponse(500, { code: "INTERNAL" });
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    expect(await screen.findByText("Beleg konnte nicht geladen werden.")).toBeInTheDocument();
  });

  it("fetches the signed receipt as soon as payment.signed arrives", async () => {
    const realtime = renderReceipt(PENDING_RECEIPT_TOKEN);
    await screen.findByText("Signatur wird erstellt…");

    server.use(http.get(apiPaths.receipt, () => HttpResponse.json(signedReceipt)));
    realtime.emit("payment.signed", { paymentId: "p1", receiptToken: "another-receipt" });
    realtime.emit("payment.signed", { paymentId: "p1", receiptToken: PENDING_RECEIPT_TOKEN });

    expect(await screen.findByRole("region", { name: "TSE-Signatur" })).toBeInTheDocument();
    expect(screen.queryByText("Signatur wird erstellt…")).not.toBeInTheDocument();
  });
});
