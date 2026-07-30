import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { findChrome } from "../scripts/browser.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = path.join(projectRoot, "artifacts");

async function waitForAssistant(page) {
  await page.waitForFunction(() => document.querySelector("#wb-checkout-assistant")?.shadowRoot);
  return page.locator("#wb-checkout-assistant");
}

async function verifyTrigger(page) {
  const assistant = await waitForAssistant(page);
  assert.equal(await assistant.locator('[data-field="count"]').textContent(), "2");
  await assistant.locator('[data-action="now"]').click();
  await assistant.locator('[data-action="start"]').click();
  await page.waitForFunction(() => window.__checkoutClicks === 1);
  await page.waitForTimeout(350);
  assert.equal(await page.evaluate(() => window.__checkoutClicks), 1);
  assert.equal(await assistant.locator(".wb-status-title").textContent(), "已触发结算");
}

await mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
const demoUrl = pathToFileURL(path.join(projectRoot, "demo", "index.html")).href;
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktop.goto(demoUrl, { waitUntil: "networkidle" });
  await verifyTrigger(desktop);
  await desktop.screenshot({ path: path.join(artifactDir, "desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(demoUrl, { waitUntil: "networkidle" });
  const assistant = await waitForAssistant(mobile);
  const box = await assistant.boundingBox();
  assert.ok(box && box.x >= 0 && box.x + box.width <= 390, "移动端面板应完整位于视口内");
  await mobile.screenshot({ path: path.join(artifactDir, "mobile.png"), fullPage: true });
} finally {
  await browser.close();
}
console.log("E2E passed: desktop trigger and mobile layout");
