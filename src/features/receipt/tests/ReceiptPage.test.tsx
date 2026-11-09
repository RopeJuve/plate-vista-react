import { render, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import {
  FAILED_RECEIPT_TOKEN,
  MISSING_RECEIPT_TOKEN,
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
  it("shows the restaurant, the time paid, the lines and the payment method", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    expect(await screen.findByRole("heading", { name: "Plate Vista" })).toBeInTheDocument();
    expect(screen.getByText(signedReceipt.restaurant.legalName)).toBeInTheDocument();
    const { street, zip, city } = signedReceipt.restaurant.address;
    expect(screen.getByText(street)).toBeInTheDocument();
    expect(screen.getByText(`${zip} ${city}`)).toBeInTheDocument();
    expect(screen.getByText(`Steuernummer: ${signedReceipt.restaurant.taxNumber}`)).toBeInTheDocument();
    expect(screen.getByText(`USt-IdNr.: ${signedReceipt.restaurant.vatId}`)).toBeInTheDocument();
    const header = screen.getByRole("heading", { name: "Plate Vista" }).parentElement!;
    expect(within(header).getByText("07.11.2026, 20:30:00")).toBeInTheDocument();

    const lines = within(screen.getByRole("list", { name: "Positionen" })).getAllByRole("listitem");
    expect(lines[0]).toHaveTextContent(`2 × Tomato soup${shown(1300)}`);
    expect(lines[1]).toHaveTextContent(`1 × House red${shown(750)}`);

    expect(screen.getByText("Summe").closest("div")).toHaveTextContent(shown(2050));
    expect(screen.getByText("Zahlungsart").closest("div")).toHaveTextContent("Karte");
  });

  it("prints one VAT row per rate from totalsByVat", async () => {
    renderReceipt(SIGNED_RECEIPT_TOKEN);

    const table = await screen.findByRole("table", { name: "Mehrwertsteuer" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(signedReceipt.totalsByVat.length);
    expect(within(rows[0]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "7 %",
      formatCents(1215),
      formatCents(85),
      formatCents(1300),
    ]);
    expect(within(rows[1]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "19 %",
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
