import { expect, test } from "@playwright/test";

/**
 * A guest calls a waiter: the bar sees the table marked, closes the call from
 * the floor, and the guest's button is ready to call again.
 */
test("a guest calls a waiter and the bar closes the call from the floor", async ({ page, browser }, testInfo) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Bell");
  await page.getByLabel("URL slug").fill("bell");
  await page.getByLabel("Your name").fill("Rae");
  await page.getByLabel("Email").fill("rae@bell.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("6");
  await page.getByLabel("Capacity").fill("4");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 6" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/bell\/t\/qr-6/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  await page.goto("/admin/register");
  await page.getByLabel("Username").fill("lou");
  await page.getByLabel("Email").fill("lou@bell.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/admin\/employees/);

  const guest = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const guestPage = await guest.newPage();
  await guestPage.goto(guestUrl);
  // Seat the table with an order, so the floor shows it as taken.
  await guestPage.getByRole("button", { name: "Add Lager to cart" }).click();
  await guestPage.getByRole("button", { name: /Open cart/ }).click();
  await guestPage.getByRole("button", { name: "Order now" }).click();
  await guestPage.keyboard.press("Escape");

  await page.goto("/staff/bell/login");
  await page.getByLabel("Username").fill("lou");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/bar/);
  await expect(page.getByRole("button", { name: "Open table 6" })).toBeVisible();

  await guestPage.getByRole("button", { name: "Call waiter" }).click();
  await expect(guestPage.getByRole("button", { name: "Waiter is on the way" })).toBeDisabled();

  const closeCall = page.getByRole("button", { name: "Close the waiter call at table 6" });
  await expect(closeCall).toBeVisible();
  await expect(page.getByText("Table 6 is calling a waiter")).toBeVisible();
  await guestPage.screenshot({ path: testInfo.outputPath("guest-called.png"), animations: "disabled" });
  await page.screenshot({ path: testInfo.outputPath("floor-called.png"), animations: "disabled" });

  await closeCall.click();
  await expect(closeCall).toBeHidden();
  await expect(guestPage.getByRole("button", { name: "Call waiter" })).toBeEnabled();

  await guest.close();
});
