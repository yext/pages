import { test, expect } from "@playwright/test";

const waitForStyling = async () => {
  await new Promise((r) => setTimeout(r, 500));
};

const LOCATION_ID = "location7";

test("index page loads", async ({ page }) => {
  throw new Error("intentional error");
  await page.goto("/");
  await waitForStyling();
  await expect(page).toHaveTitle(/Pages Development Page/);
  await expect(page.locator("a", { hasText: LOCATION_ID })).toHaveAttribute(
    "href",
    `${page.url()}location/${LOCATION_ID}`
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
  await page.goto(`/location/${LOCATION_ID}`);
  await waitForStyling();
  await expect(page.locator("body > div")).toHaveText("622 Broadway");
  await expect(page).toHaveScreenshot();
});
