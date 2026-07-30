import { existsSync } from "node:fs";

export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].filter(Boolean);
  const executable = candidates.find(existsSync);
  if (!executable) throw new Error("未找到可用于浏览器验证的 Chrome/Edge");
  return executable;
}
