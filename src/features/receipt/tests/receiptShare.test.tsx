import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { SIGNED_RECEIPT_TOKEN } from "../../../mocks/fixtures/receipts";
import { createMockRealtime } from "../../../test/mockRealtime";
import RealtimeTestProviders from "../../../test/RealtimeTestProviders";
import ReceiptPage from "../ReceiptPage";

const renderReceipt = async () => {
  render(
    <RealtimeTestProviders realtime={createMockRealtime()} path={`/receipt/${SIGNED_RECEIPT_TOKEN}`}>
      <Routes>
        <Route path="/receipt/:receiptToken" element={<ReceiptPage />} />
      </Routes>
    </RealtimeTestProviders>
  );
  await screen.findByRole("heading", { name: "Plate Vista" });
};

const setClipboard = (clipboard: Partial<Clipboard> | undefined) =>
  Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });

afterEach(() => {
  vi.restoreAllMocks();
  setClipboard(undefined);
});

describe("receipt print and share", () => {
  it("opens the print dialog from the print button", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    await renderReceipt();

    fireEvent.click(screen.getByRole("button", { name: "Drucken / als PDF speichern" }));

    expect(print).toHaveBeenCalledTimes(1);
  });

  it("copies the page URL and confirms it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    await renderReceipt();

    fireEvent.click(screen.getByRole("button", { name: "Link kopieren" }));

    expect(await screen.findByText("Link kopiert")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows the URL selected in a text field when there is no clipboard", async () => {
    setClipboard(undefined);
    await renderReceipt();

    fireEvent.click(screen.getByRole("button", { name: "Link kopieren" }));

    const field = await screen.findByRole("textbox", { name: "Link zum Beleg" });
    expect(field).toHaveValue(window.location.href);
    expect(field).toHaveFocus();
    const input = field as HTMLInputElement;
    expect(input.value.slice(input.selectionStart!, input.selectionEnd!)).toBe(window.location.href);
    expect(screen.queryByText("Link kopiert")).not.toBeInTheDocument();
  });

  it("falls back to the text field when writing to the clipboard is refused", async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")) });
    await renderReceipt();

    fireEvent.click(screen.getByRole("button", { name: "Link kopieren" }));

    expect(await screen.findByRole("textbox", { name: "Link zum Beleg" })).toHaveValue(window.location.href);
  });

  it("prints only the receipt: navigation and buttons are hidden in print", async () => {
    await renderReceipt();

    const main = screen.getByRole("main");
    const receipt = screen.getByRole("article");
    expect(main).toHaveClass("receipt-print");
    for (const child of Array.from(main.children)) {
      if (child.contains(receipt)) expect(child).not.toHaveClass("print:hidden");
      else expect(child).toHaveClass("print:hidden");
    }
    expect(screen.getByRole("group", { name: "Beleg teilen" })).toHaveClass("print:hidden");
  });
});
