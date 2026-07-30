import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const repository = "https://github.com/Blackwindow6/Tampermonkey-Weidian-Buy";
const rawScript = "https://raw.githubusercontent.com/Blackwindow6/Tampermonkey-Weidian-Buy/main/weidian-checkout.user.js";

async function readVersion() {
  const content = await readFile(new URL("../package.json", import.meta.url), "utf8");
  return JSON.parse(content).version;
}

function createMetadata(version) {
  return `// ==UserScript==
// @name         微店定时结算助手
// @namespace    ${repository}
// @version      ${version}
// @description  在微店购物车按设定时间触发一次结算，并显示真实页面状态
// @author       Blackwindow6
// @match        https://weidian.com/new-cart/index.php*
// @match        https://www.weidian.com/new-cart/index.php*
// @icon         https://s.geilicdn.com/user/images/favicon.ico
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @homepageURL  ${repository}
// @supportURL   ${repository}/issues
// @updateURL    ${rawScript}
// @downloadURL  ${rawScript}
// ==/UserScript==`;
}

const version = await readVersion();
await build({
  entryPoints: ["src/main.js"],
  outfile: "weidian-checkout.user.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome100", "firefox100"],
  minify: true,
  legalComments: "none",
  define: { __APP_VERSION__: JSON.stringify(version) },
  banner: { js: createMetadata(version) },
});
console.log(`Built weidian-checkout.user.js v${version}`);
