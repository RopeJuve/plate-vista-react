import { expect, test } from "@playwright/test";

/**
 * A guest order must be visible on the admin Orders page with its table
 * number and a coloured status badge, and counted on the Overview card.
 */
test("a guest order reaches the admin dashboard", async ({ page, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Pier");
  await page.getByLabel("URL slug").fill("pier");
  await page.getByLabel("Your name").fill("Grace");
  await page.getByLabel("Email").fill("grace@pier.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("7");
  await page.getByLabel("Capacity").fill("2");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 7" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/pier\/t\/qr-7/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(guestUrl);
  await guestPage.getByRole("button", { name: "Add Lager to cart" }).click();
  await guestPage.getByRole("button", { name: /Open cart/ }).click();
  const orderNow = guestPage.getByRole("button", { name: "Order now" });
  await expect(orderNow).toBeEnabled();
  await orderNow.click();
  await guestPage.getByRole("button", { name: "Bill" }).click();
  await expect(guestPage.getByRole("dialog", { name: "Cart" }).getByText("Pending")).toBeVisible();
  await guest.close();

  await page.goto("/admin/orders");
  const row = page.getByRole("row").filter({ hasText: "Lager" });
  await expect(row).toHaveCount(1);

  // The order total must be rendered from totalCents.
  await expect(row).toContainText("4,50");

  // The status badge must be labelled AND coloured for a pending order.
  const badge = row.getByText("Pending", { exact: true });
  await expect(badge).toBeVisible();
  await expect(badge).toHaveClass(/bg-signal/);

  // The Location column (6th cell) must show the guest's table number, not blank.
  await expect(row.getByRole("cell").nth(5)).toHaveText("7");

  await page.goto("/admin/overview");
  await expect(page.getByRole("button", { name: /^Total Orders 1$/ })).toBeVisible();
});
