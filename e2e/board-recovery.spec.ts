import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:5099/api/v1";

/**
 * The staff board snapshot comes from `GET /staff/board`. If that one request
 * fails (a cold start, a brief outage) the board must recover — otherwise the
 * socket stays connected while every incoming order is silently discarded, and
 * the bar sees an empty board for the rest of the shift.
 */
test("the bar board still shows new orders after a failed snapshot fetch", async ({ page, request, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Quay");
  await page.getByLabel("URL slug").fill("quay");
  await page.getByLabel("Your name").fill("Nia");
  await page.getByLabel("Email").fill("nia@quay.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("3");
  await page.getByLabel("Capacity").fill("2");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 3" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/quay\/t\/qr-3/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  await page.goto("/admin/register");
  await page.getByLabel("Username").fill("kit");
  await page.getByLabel("Email").fill("kit@quay.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/admin\/employees/);

  // The bar's first board snapshot fails.
  await request.post(`${API}/_test/faults`, { data: { failNextBoard: true } });

  await page.goto("/staff/quay/login");
  await page.getByLabel("Username").fill("kit");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/bar/);
  await page.getByText("Orders", { exact: true }).click();

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

  // The order must appear on the bar board despite the failed snapshot.
  await expect(page.getByRole("button", { name: "Accept" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Table 3")).toBeVisible();
});
