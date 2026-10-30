// End-to-end test: starts nothing itself (see playwright.config.js webServer),
// drives the real EnquiryForm in a real browser against the real Django
// backend, and confirms a full legitimate submission succeeds.
const { test, expect } = require("@playwright/test");

test("submits an enquiry with a solved CAPTCHA and shows the success message", async ({ page }) => {
  await page.goto("/");

  const captchaBox = page.locator(".captcha-box");
  await expect(captchaBox).not.toHaveText("");

  const question = (await captchaBox.textContent()).trim();
  const match = question.match(/(\d+)\s*([+\-*])\s*(\d+)/);
  expect(match).not.toBeNull();
  const [, aStr, operator, bStr] = match;
  const a = Number(aStr);
  const b = Number(bStr);
  const answer = { "+": a + b, "-": a - b, "*": a * b }[operator];

  await page.getByPlaceholder("Name").fill("Playwright E2E");
  await page.getByPlaceholder("Email").fill("playwright@example.com");
  await page.getByPlaceholder("Mobile No.").fill("9999999999");
  await page.getByPlaceholder("Message").fill("End-to-end test enquiry");
  await page.getByPlaceholder("Enter answer").fill(String(answer));

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: /submit now/i }).click();

  await expect.poll(() => dialogMessage).toContain("Enquiry submitted successfully");

  // the CAPTCHA token is single-use, so the form should have fetched a fresh
  // challenge and reset itself after a successful submission
  await expect(page.getByPlaceholder("Name")).toHaveValue("");
  await expect(captchaBox).not.toHaveText(question);
});

test("rejects submission when the CAPTCHA answer is wrong", async ({ page }) => {
  await page.goto("/");

  const captchaBox = page.locator(".captcha-box");
  await expect(captchaBox).not.toHaveText("");

  await page.getByPlaceholder("Name").fill("Playwright E2E Wrong Captcha");
  await page.getByPlaceholder("Email").fill("playwright-wrong@example.com");
  await page.getByPlaceholder("Mobile No.").fill("9999999999");
  await page.getByPlaceholder("Message").fill("End-to-end test enquiry");
  // deliberately wrong: no question ever evaluates to this literal string
  await page.getByPlaceholder("Enter answer").fill("999999");

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: /submit now/i }).click();

  await expect.poll(() => dialogMessage).toContain("Incorrect CAPTCHA answer");
});
