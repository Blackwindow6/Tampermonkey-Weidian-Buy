const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DEFAULT_LEAD_MS = 5 * MINUTE_MS;

export const DEFAULT_POLL_INTERVAL = 100;
export const POLL_INTERVALS = Object.freeze([100, 250, 500]);

function pad(value, length = 2) {
  return String(value).padStart(length, "0");
}

export function toDateTimeLocal(timestamp) {
  const date = new Date(timestamp);
  const day = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
  const time = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(":");
  return `${day}T${time}`;
}

export function createDefaultSettings(nowMs) {
  return Object.freeze({
    targetAt: toDateTimeLocal(nowMs + DEFAULT_LEAD_MS),
    pollInterval: DEFAULT_POLL_INTERVAL,
  });
}

export function parseTargetAt(value) {
  const pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
  const match = pattern.exec(String(value).trim());
  if (!match) {
    throw new Error("目标时间格式无效，请重新选择日期和时间");
  }

  const parts = match.slice(1).map((part) => Number(part || 0));
  const [year, month, day, hour, minute, second] = parts;
  const date = new Date(year, month - 1, day, hour, minute, second);
  const actual = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
  if (actual.some((part, index) => part !== parts[index])) {
    throw new Error("目标时间不存在，请检查日期和时间");
  }
  return date.getTime();
}

export function normalizeSettings(value) {
  if (!value || typeof value !== "object") {
    throw new Error("结算配置无效");
  }

  const targetAt = String(value.targetAt || "").trim();
  const pollInterval = Number(value.pollInterval);
  parseTargetAt(targetAt);
  if (!Number.isInteger(pollInterval) || pollInterval <= 0) {
    throw new Error("检查频率必须是正整数毫秒值");
  }
  return Object.freeze({ targetAt, pollInterval });
}

export function decideAction(options) {
  const { nowMs, targetMs, inspection } = options;
  if (nowMs < targetMs) {
    return Object.freeze({ type: "wait-time", remainingMs: targetMs - nowMs });
  }
  if (inspection.kind !== "ready") {
    return Object.freeze({ type: "wait-button", remainingMs: 0 });
  }
  return Object.freeze({ type: "trigger", remainingMs: 0 });
}

export function formatCountdown(valueMs) {
  const remaining = Math.max(0, valueMs);
  const hours = Math.floor(remaining / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((remaining % MINUTE_MS) / SECOND_MS);
  const tenths = Math.floor((remaining % SECOND_MS) / (SECOND_MS / 10));
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${tenths}`;
}

export function formatLogTime(timestamp) {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
