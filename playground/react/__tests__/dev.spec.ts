import { test, expect } from "@playwright/test";
import { editFile } from "../../test-utils.js";

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
  await page.goto("/robots");
  await waitForVite();
  expect(page.locator("text='test")).toBeTruthy();
  await expect(page).toHaveScreenshot();
});

test("static page loads", async ({ page }) => {
  await page.goto("/turtlehead-tacos");
  await waitForVite();
  await expect(page.locator("h1")).toHaveText("Welcome to Turtlehead Tacos");
  await expect(page).toHaveScreenshot();
});

test("entity page loads", async ({ page }) => {
  await page.goto("/location/dangiel1");
  await waitForVite();
  expect(page.locator("text='All About Plumbing")).toBeTruthy();
  expect(await page.waitForSelector(".bg-red-900")).toBeTruthy();
  await expect(page).toHaveScreenshot();
});

test("hmr works", async ({ page }) => {
  await page.goto("/location/dangiel1");
  await waitForVite();

  // banner color should be red
  expect(await page.waitForSelector(".bg-red-900")).toBeTruthy();

  // update banner color to blue
  editFile("src/components/banner.tsx", (code) =>
    code.replace("bg-red-900", "bg-blue-900")
  );
  await waitForVite();

  // banner color should be blue
  expect(await page.waitForSelector(".bg-blue-900")).toBeTruthy();

  await expect(page).toHaveScreenshot();

  // reset banner color back to red
  editFile("src/components/banner.tsx", (code) =>
    code.replace("bg-blue-900", "bg-red-900")
  );
});
