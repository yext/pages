import { test, expect } from "@playwright/test";

test("index page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Pages Development Page/);
  await expect(page).toHaveScreenshot();
});

test("robots page loads", async ({ page }) => {
  await page.goto("/robots.txt");
  expect(page.locator("pre")).toHaveText("robots");
  await expect(page).toHaveScreenshot();
});

test("static page loads", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("body > div")).toHaveText("Static Page");
  await expect(page).toHaveScreenshot();
});

test("entity page loads", async ({ page }) => {
  await page.goto("/location/location7");
  await expect(page.locator("body > div")).toHaveText("622 Broadway");
  await expect(page).toHaveScreenshot();
});
