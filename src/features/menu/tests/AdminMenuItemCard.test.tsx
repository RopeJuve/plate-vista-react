import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MenuItem } from "../../../types";
import AdminMenuItemCard from "../AdminMenuItemCard";

const item: MenuItem = { _id: "item-1", title: "Lemonade", price: 4, categoryId: "cat-drinks", category: "Drinks" };
const noop = () => undefined;

describe("AdminMenuItemCard", () => {
  it("shows the VAT rate it takes from its category", () => {
    render(<AdminMenuItemCard item={item} vatRate="NORMAL" onEdit={noop} onDelete={noop} />);
    expect(screen.getByText("19 %")).toBeInTheDocument();
  });

  it("shows 7 % for a food category", () => {
    render(<AdminMenuItemCard item={{ ...item, title: "Soup" }} vatRate="REDUCED_1" onEdit={noop} onDelete={noop} />);
    expect(screen.getByText("7 %")).toBeInTheDocument();
  });

  it("shows no rate while the category is unknown", () => {
    render(<AdminMenuItemCard item={item} onEdit={noop} onDelete={noop} />);
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });
});
