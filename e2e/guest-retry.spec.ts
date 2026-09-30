import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:5099/api/v1";

/**
 * When the socket drops mid-submit, the client retries the order on reconnect.
 * That retry must settle the cart exactly like a first-try success: the cart
 * empties and the bill holds exactly one order. Otherwise the guest sees a
 * full cart after a placed order and re-sends it as a duplicate.
 */
test("an order retried after a dropped connection empties the cart once", async ({ page, request, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Dock");
  await page.getByLabel("URL slug").fill("dock");
  await page.getByLabel("Your name").fill("Rey");
  await page.getByLabel("Email").fill("rey@dock.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("9");
  await page.getByLabel("Capacity").fill("2");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 9" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/dock\/t\/qr-9/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(guestUrl);
  await guestPage.getByRole("button", { name: "Add Lager to cart" }).click();

  // The next order.create is swallowed and the socket is killed.
  await request.post(`${API}/_test/faults`, { data: { dropNextOrderCreate: true } });

  const cartButton = guestPage.getByRole("button", { name: /Open cart/ });
  await cartButton.click();
  const orderNow = guestPage.getByRole("button", { name: "Order now" });
  await expect(orderNow).toBeEnabled();
  await orderNow.click();

  // The reconnect retry lands the order: the bill shows it.
  const dialog = guestPage.getByRole("dialog", { name: "Cart" });
  await dialog.getByRole("button", { name: "Bill", exact: true }).click();
  await expect(dialog.getByText("Pending")).toHaveCount(1);

  // ...and the cart must be empty, exactly as after a first-try success.
  await dialog.getByRole("button", { name: "Cart", exact: true }).click();
  await expect(dialog.getByText("Cart is empty")).toBeVisible();

  await guest.close();
});
