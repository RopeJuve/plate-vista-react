import { expect, test } from "@playwright/test";

/**
 * Categories are the menu's sections and decide the station. An item needs no
 * image or description: guests then see the placeholder for its station.
 */
test("an owner adds a bar category and an item without an image", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Reef");
  await page.getByLabel("URL slug").fill("reef");
  await page.getByLabel("Your name").fill("Mara");
  await page.getByLabel("Email").fill("mara@reef.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/categories");
  await page.getByLabel("New category", { exact: true }).fill("Shots");
  await page.getByLabel("Station for the new category").click();
  await page.getByRole("option", { name: "Bar" }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("Shots", { exact: true })).toBeVisible();

  // Names are unique, ignoring case.
  await page.getByLabel("New category", { exact: true }).fill("shots");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("A category with this name already exists")).toBeVisible();

  // The new category can move above "beer".
  await page.getByRole("button", { name: "Move Shots up" }).click();
  const inOrder = page.getByRole("list", { name: "Categories in menu order" }).getByRole("listitem");
  await expect(inOrder.first()).toContainText("Shots");

  await page.goto("/admin/menu");
  await page.getByRole("button", { name: "Add New Item" }).first().click();
  const dialog = page.getByRole("dialog", { name: "New menu item" });
  await dialog.getByLabel("Title").fill("Tequila Shot");
  await dialog.getByLabel("Price (€)").fill("4");
  await dialog.getByLabel("Category").click();
  await page.getByRole("option", { name: "Shots · Bar" }).click();

  // Without Cloudinary the upload explains itself; the item still saves.
  await dialog.getByLabel("Image link").fill("http://not-secure.example/x.jpg");
  await dialog.getByRole("button", { name: "Add" }).click();
  await expect(dialog.getByText("The link must start with https://")).toBeVisible();
  await dialog.getByLabel("Image link").fill("");
  await dialog.getByRole("button", { name: "Add" }).click();
  await expect(dialog).toBeHidden();

  const card = page.getByRole("article").filter({ hasText: "Tequila Shot" });
  await expect(card).toContainText("Shots");
  await expect(card.locator("img")).toHaveCount(0);

  // A category with items cannot be deleted.
  await page.goto("/admin/categories");
  page.once("dialog", (confirm) => void confirm.accept());
  await page.getByRole("button", { name: "Delete Shots" }).click();
  await expect(page.getByText("Move its 1 item to another category first")).toBeVisible();
});
