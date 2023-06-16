import { test, expect } from "@playwright/test";

const waitForStyling = async () => {
  await new Promise((r) => setTimeout(r, 500));
};

const HOLBROOK_ID = "2272132526004354756";

test("index page loads", async ({ page }) => {
  await page.goto("/");
  await waitForStyling();
  await expect(page).toHaveTitle(/Pages Development/);
  await expect(page.locator("a", { hasText: HOLBROOK_ID })).toHaveAttribute(
    "href",
    `${page.url()}sunglasses/${HOLBROOK_ID}`
  );
  await expect(page).toHaveScreenshot();
});

test("robots page loads", async ({ page }) => {
  await page.goto("/robots.txt");
  await waitForStyling();
  expect(page.locator("pre")).toHaveText("robots");
  await expect(page).toHaveScreenshot();
});

test("static page loads", async ({ page }) => {
  await page.goto("/index.html");
  await waitForStyling();
  await expect(page.locator("body > div")).toHaveText("Static Page");
  await expect(page).toHaveScreenshot();
});

test("entity page loads", async ({ page }) => {
  await page.goto(`/sunglasses/${HOLBROOK_ID}`);
  await waitForStyling();
  await expect(page.locator("body > div")).toHaveText("Holbrook");
  await expect(page).toHaveScreenshot();
});
