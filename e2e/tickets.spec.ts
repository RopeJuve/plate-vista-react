import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:5099/api/v1";

/**
 * Drinks and food ordered together are one order with a ticket per station:
 * the bar moves its ticket without touching the kitchen's, and the guest sees
 * a progress row for each.
 */
test("the bar accepts the drinks while the food is still pending", async ({ page, browser, request }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Quay");
  await page.getByLabel("URL slug").fill("quay");
  await page.getByLabel("Your name").fill("Noor");
  await page.getByLabel("Email").fill("noor@quay.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  const oven = await (await request.post(`${API}/categories`, { data: { name: "Oven", station: "kitchen" } })).json();
  await request.post(`${API}/menu-items`, { data: { title: "Margherita", price: 9, categoryId: oven._id } });

  await page.goto("/admin/tables");
  await page.getByLabel("Table number").fill("7");
  await page.getByLabel("Capacity").fill("2");
  await page.getByRole("button", { name: "Add table" }).click();
  await expect(page.getByRole("button", { name: "Open details for table 7" })).toBeVisible();

  await page.goto("/admin/qrcodes");
  const guestLink = page.getByText(/\/r\/quay\/t\/qr-7/);
  await expect(guestLink).toBeVisible();
  const guestUrl = (await guestLink.innerText()).trim();

  await page.goto("/admin/register");
  await page.getByLabel("Username").fill("kim");
  await page.getByLabel("Email").fill("kim@quay.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/admin\/employees/);

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(guestUrl);
  await guestPage.getByRole("button", { name: "Add Lager to cart" }).click();
  await guestPage.getByRole("tab", { name: "Oven" }).click();
  await guestPage.getByRole("button", { name: "Add Margherita to cart" }).click();
  await guestPage.getByRole("button", { name: /Open cart/ }).click();
  await guestPage.getByRole("button", { name: "Order now" }).click();
  await guestPage.getByRole("button", { name: "Bill" }).click();
  const bill = guestPage.getByRole("dialog", { name: "Cart" });
  const drinks = bill.getByRole("listitem").filter({ hasText: "Drinks" });
  const food = bill.getByRole("listitem").filter({ hasText: "Food" });
  await expect(drinks).toContainText("Pending");
  await expect(food).toContainText("Pending");

  await page.goto("/staff/quay/login");
  await page.getByLabel("Username").fill("kim");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/bar/);

  await page.getByText("Orders", { exact: true }).click();
  const barTicket = page.getByRole("article", { name: "Bar ticket for table 7" });
  const kitchenTicket = page.getByRole("article", { name: "Kitchen ticket for table 7" });
  await expect(barTicket).toContainText("Lager");
  await expect(barTicket).not.toContainText("Margherita");
  await expect(kitchenTicket).toContainText("Margherita");

  await barTicket.getByRole("button", { name: "Accept" }).click();
  await expect(barTicket.getByRole("button", { name: "Start" })).toBeVisible();
  await expect(kitchenTicket.getByRole("button", { name: "Accept" })).toBeVisible();

  await expect(drinks).toContainText("Accepted");
  await expect(food).toContainText("Pending");
  // Once a station has started, the guest can no longer change the order.
  await expect(bill.getByRole("button", { name: "Cancel order" })).toHaveCount(0);

  // The kitchen filter hides the bar's ticket.
  await page.getByRole("radio", { name: "Kitchen" }).click();
  await expect(kitchenTicket).toBeVisible();
  await expect(barTicket).toHaveCount(0);
  await guest.close();
});
