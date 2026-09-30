import { expect, test } from "@playwright/test";

/**
 * Until a station starts on it, an order on the bill is still the guest's to
 * change: they can amend its quantities or cancel it, and backing out of the
 * cancellation leaves the order alone.
 */
test("a guest amends and then cancels a pending order from the bill", async ({ page, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Mole");
  await page.getByLabel("URL slug").fill("mole");
  await page.getByLabel("Your name").fill("Ines");
  await page.getByLabel("Email").fill("ines@mole.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("9");
  await page.getByLabel("Capacity").fill("2");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 9" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/mole\/t\/qr-9/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(guestUrl);
  await guestPage.getByRole("button", { name: "Add Lager to cart" }).click();
  await guestPage.getByRole("button", { name: /Open cart/ }).click();
  await guestPage.getByRole("button", { name: "Order now" }).click();
  await guestPage.getByRole("button", { name: "Bill" }).click();
  const bill = guestPage.getByRole("dialog", { name: "Cart" });
  await expect(bill.getByText("1×")).toBeVisible();

  await bill.getByRole("button", { name: "Edit" }).click();
  await bill.getByRole("button", { name: "Increase Lager" }).click();
  await bill.getByRole("button", { name: "Save changes" }).click();
  await expect(bill.getByText("2×")).toBeVisible();
  await expect(bill.getByRole("button", { name: "Save changes" })).toHaveCount(0);

  await bill.getByRole("button", { name: "Cancel order" }).click();
  await bill.getByRole("button", { name: "Keep order" }).click();
  await expect(bill.getByText("Pending")).toBeVisible();

  await bill.getByRole("button", { name: "Cancel order" }).click();
  await bill.getByLabel("Why are you cancelling this order?").fill("Ordered by mistake");
  await bill.getByRole("button", { name: "Cancel order" }).click();
  await expect(bill.getByText("Ordered by mistake")).toBeVisible();
  await expect(bill.getByRole("button", { name: "Cancel order" })).toHaveCount(0);

  await guest.close();
});
