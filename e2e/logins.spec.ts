import { expect, test } from "@playwright/test";

/**
 * Owners sign in at /login with their email. Staff sign in inside their
 * restaurant (/staff/<slug>/login), because two restaurants may each have an
 * employee with the same name. The device remembers the restaurant, so after a
 * logout the bar tablet lands back on its own restaurant's login.
 */
test("owners use email at /login and staff use their restaurant's login", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Dock");
  await page.getByLabel("URL slug").fill("dock");
  await page.getByLabel("Your name").fill("Ada");
  await page.getByLabel("Email").fill("ada@dock.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  // Staff need no email.
  await page.goto("/admin/register");
  await page.getByLabel("Username").fill("Rope");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/admin\/employees/);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Owner sign in" })).toBeVisible();
  await page.getByLabel("Email").fill("ADA@dock.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/staff/login");
  await page.getByLabel("Restaurant code").fill("nope");
  await page.getByLabel("Username").fill("rope");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid credentials");

  await page.getByLabel("Restaurant code").fill("dock");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/bar/);

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/staff\/dock\/login$/);
  await expect(page.getByText("Restaurant dock")).toBeVisible();
  await expect(page.getByLabel("Restaurant code")).toHaveCount(0);
});
