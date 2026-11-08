import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TotalLine from "../TotalLine";

describe("TotalLine", () => {
  it("prints the label and the amount in euros", () => {
    render(<TotalLine label="Total" cents={1250} strong />);

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText(/12,50\s€/)).toBeInTheDocument();
  });
});
