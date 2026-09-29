import { expect, test } from "@playwright/test";

/**
 * The bar's order pad belongs to the table currently open. Lines added for one
 * table must not follow the waiter to the next one, or they get sent to the
 * wrong table.
 */
test("the bar order pad does not carry between tables", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Cove");
  await page.getByLabel("URL slug").fill("cove");
  await page.getByLabel("Your name").fill("Ilo");
  await page.getByLabel("Email").fill("ilo@cove.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/tables");
  for (const number of ["1", "2"]) {
    await page.getByLabel("Table number").fill(number);
    await page.getByLabel("Capacity").fill("2");
    await page.getByRole("button", { name: "Add table" }).click();
    await expect(page.getByRole("button", { name: `Open details for table ${number}` })).toBeVisible();
  }

  await page.goto("/admin/register");
  await page.getByLabel("Username").fill("mo");
  await page.getByLabel("Email").fill("mo@cove.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/admin\/employees/);

  await page.goto("/");
  await page.locator("#employee").fill("mo");
  await page.locator('input[type="password"]').fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/bar/);

  // Start a pad on table 1.
  await page.getByRole("button", { name: "Open table 1" }).click();
  await page.getByRole("button", { name: /^Lager · / }).click();
  const placeOrder = page.getByRole("button", { name: "Place order" });
  await expect(placeOrder).toBeEnabled();

  // Table 2 must start from an empty pad.
  await page.goBack();
  await page.getByRole("button", { name: "Open table 2" }).click();
  await expect(page.getByRole("heading", { name: "Table 2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Place order" })).toBeDisabled();
});
