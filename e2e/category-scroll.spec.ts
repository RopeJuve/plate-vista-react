import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:5099/api/v1";

/**
 * A long category bar scrolls sideways with the arrow buttons and the mouse
 * wheel, not only by swiping, and never widens the page.
 */
test("the admin menu's category bar scrolls sideways when the categories do not fit", async ({ page, request }) => {
  await page.setViewportSize({ width: 700, height: 800 });
  await page.goto("/register");
  await page.getByLabel("Restaurant name").fill("Pier Nine");
  await page.getByLabel("URL slug").fill("pier-nine");
  await page.getByLabel("Your name").fill("Ines");
  await page.getByLabel("Email").fill("ines@pier.test");
  await page.getByLabel("Password").fill("secret1");
  await page.getByRole("button", { name: "Create restaurant" }).click();
  await expect(page).toHaveURL(/\/admin/);

  for (const name of ["Starters", "Soups", "Salads", "Pizza", "Pasta", "Burgers", "Main Courses", "Desserts"]) {
    const category = await (await request.post(`${API}/categories`, { data: { name, station: "kitchen" } })).json();
    await request.post(`${API}/menu-items`, { data: { title: `${name} special`, price: 5, categoryId: category._id } });
  }

  await page.goto("/admin/menu");
  const row = page.getByRole("tablist", { name: "Filter by category" });
  await expect(row.getByRole("tab", { name: "Desserts" })).toBeAttached();
  const scrollLeft = () => row.evaluate((element) => element.scrollLeft);

  // The page itself never scrolls sideways.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await expect(page.getByRole("button", { name: "Scroll categories left" })).toHaveCount(0);
  await page.getByRole("button", { name: "Scroll categories right" }).click();
  await expect.poll(scrollLeft).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Scroll categories left" })).toBeVisible();

  const afterArrow = await scrollLeft();
  await row.hover();
  await page.mouse.wheel(0, 300);
  await expect.poll(scrollLeft).toBeGreaterThan(afterArrow);

  // Choosing a tab at the far end keeps it in view.
  await row.getByRole("tab", { name: "Desserts" }).click();
  await expect(row.getByRole("tab", { name: "Desserts" })).toBeInViewport();
});
