import { expect, test } from "@playwright/test";

test("guest order is accepted and the table close ends on thank you", async ({ page, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Harbor");
  await page.getByLabel("URL slug").fill("harbor");
  await page.getByLabel("Your name").fill("Ada");
  await page.getByLabel("Email").fill("ada@harbor.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("4");
  await page.getByLabel("Capacity").fill("4");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 4" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/harbor\/t\/qr-4/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  await page.goto("/admin/register");
  await page.getByLabel("Username").fill("sam");
  await page.getByLabel("Email").fill("sam@harbor.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/admin\/employees/);

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

  await page.goto("/");
  await page.locator("#employee").fill("sam");
  await page.locator('input[type="password"]').fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/bar/);

  await page.getByText("Orders", { exact: true }).click();
  const accept = page.getByRole("button", { name: "Accept" });
  await expect(accept).toBeEnabled();
  await accept.click();
  await expect(page.getByText("Accepted")).toBeVisible();

  await expect(guestPage.getByRole("dialog", { name: "Cart" }).getByText("Accepted")).toBeVisible();

  await page.getByText("Dine In", { exact: true }).click();
  await page.getByRole("button", { name: "Open table 4" }).click();
  await page.getByRole("button", { name: "Close table" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Close table" }).click();

  await expect(guestPage.getByRole("heading", { name: "Thank you" })).toBeVisible();
  await guest.close();
});
