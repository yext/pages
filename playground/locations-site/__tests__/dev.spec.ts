import { test, expect } from "@playwright/test";

// gives the page time to hydrate
const waitForVite = async () => {
  await new Promise((r) => setTimeout(r, 500));
};

test("index page loads", async ({ page }) => {
  await page.goto("/");
  await waitForVite();
  await expect(page).toHaveTitle(/Pages Development Page/);
  await expect(page).toHaveScreenshot();
});

test("robots page loads", async ({ page }) => {
  await page.goto("/robots.txt");
  await waitForVite();
  expect(page.locator("pre")).toHaveText("robots");
  await expect(page).toHaveScreenshot();
});

test("static page loads", async ({ page }) => {
  await page.goto("/index.html");
  await waitForVite();
  await expect(page.locator("body > div")).toHaveText("Static Page");
  await expect(page).toHaveScreenshot();
});

test("entity page loads", async ({ page }) => {
  await page.goto("/location/location7");
  await waitForVite();
  await expect(page.locator("body > div")).toHaveText("622 Broadway");
  await expect(page).toHaveScreenshot();
});
