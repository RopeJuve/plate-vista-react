import { expect, test } from "@playwright/test";

/**
 * The first guest to scan a free table opens it and gets a join code. Anyone
 * scanning after needs that code; a guest who already joined gets back in on
 * reload without it.
 */
test("a second guest needs the join code; a reload does not", async ({ page, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Pier");
  await page.getByLabel("URL slug").fill("pier");
  await page.getByLabel("Your name").fill("Lin");
  await page.getByLabel("Email").fill("lin@pier.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("7");
  await page.getByLabel("Capacity").fill("4");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 7" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/pier\/t\/qr-7/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  const first = await browser.newContext();
  const firstPage = await first.newPage();
  await firstPage.goto(guestUrl);
  const banner = firstPage.getByRole("status").filter({ hasText: "Friends joining?" });
  await expect(banner).toBeVisible();
  const joinCode = (await banner.locator(".font-mono").innerText()).trim();
  expect(joinCode).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);

  // Reloading sends the stored guest token: straight back to the menu.
  await firstPage.reload();
  await expect(firstPage.getByRole("button", { name: "Add Lager to cart" })).toBeVisible();

  const second = await browser.newContext();
  const secondPage = await second.newPage();
  await secondPage.goto(guestUrl);
  await expect(secondPage.getByRole("heading", { name: "This table is open" })).toBeVisible();

  const input = secondPage.getByLabel("Table code");
  const wrong = joinCode === "AAAA" ? "BBBB" : "AAAA";
  await input.fill(wrong);
  await secondPage.getByRole("button", { name: "Join table" }).click();
  await expect(secondPage.getByRole("alert")).toContainText("doesn’t match");

  await input.fill(joinCode.toLowerCase());
  await secondPage.getByRole("button", { name: "Join table" }).click();
  await expect(secondPage.getByRole("button", { name: "Add Lager to cart" })).toBeVisible();

  await first.close();
  await second.close();
});
