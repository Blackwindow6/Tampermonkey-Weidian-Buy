import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { findChrome } from "./browser.mjs";

const CART_URL = "https://weidian.com/new-cart/index.php";
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = path.join(projectRoot, "artifacts");

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Chrome/138 Safari/537.36" } });
  if (!response.ok) throw new Error(`线上资源请求失败：${response.status} ${response.url}`);
  return response.text();
}

async function verifyProductionBundle() {
  const html = await fetchText(CART_URL);
  assert.match(html, /data-spider="cart_index"/, "线上入口应返回真实购物车应用");
  const match = html.match(/src="(https:\/\/s\.geilicdn\.com\/node\/cart-server-mixed\/index\/index\.[a-f0-9]+\.js)"/);
  assert.ok(match, "购物车页面应包含当前生产 bundle");
  const bundle = await fetchText(match[1]);
  assert.match(bundle, /staticClass:"go_buy wd-theme__button1"/, "生产 bundle 应包含结算按钮结构");
  return match[1];
}

async function verifyInjectedPanel() {
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  try {
    const context = await browser.newContext({ bypassCSP: true, viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      const values = new Map();
      window.GM_getValue = (key, defaultValue) => values.has(key) ? values.get(key) : defaultValue;
      window.GM_setValue = (key, value) => values.set(key, value);
    });
    const page = await context.newPage();
    await page.goto(CART_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    assert.equal(await page.locator("body").getAttribute("data-spider"), "cart_index");
    await page.addScriptTag({ path: path.join(projectRoot, "weidian-checkout.user.js") });
    const assistant = page.locator("#wb-checkout-assistant");
    await assistant.waitFor({ state: "attached" });
    const title = await assistant.locator(".wb-status-title").textContent();
    assert.equal(title, "未定位结算按钮");
    await mkdir(artifactDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactDir, "live-cart.png"), fullPage: true });
    return title;
  } finally {
    await browser.close();
  }
}

const bundleUrl = await verifyProductionBundle();
const panelStatus = await verifyInjectedPanel();
console.log(`Live verified: ${panelStatus} | ${bundleUrl}`);
