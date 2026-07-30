import test from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultSettings,
  decideAction,
  formatCountdown,
  normalizeSettings,
  parseTargetAt,
  toDateTimeLocal,
} from "../src/core.js";

test("默认目标时间设置为五分钟后", () => {
  const now = new Date(2026, 6, 30, 14, 0, 0).getTime();
  const settings = createDefaultSettings(now);
  assert.equal(parseTargetAt(settings.targetAt) - now, 5 * 60 * 1000);
  assert.equal(settings.pollInterval, 100);
});

test("日期时间按本地时间往返转换", () => {
  const timestamp = new Date(2026, 6, 30, 8, 9, 7).getTime();
  assert.equal(toDateTimeLocal(timestamp), "2026-07-30T08:09:07");
  assert.equal(parseTargetAt("2026-07-30T08:09:07"), timestamp);
});

test("不存在的日期会明确报错", () => {
  assert.throws(() => parseTargetAt("2026-02-30T12:00:00"), /目标时间不存在/);
});

test("配置拒绝无效检查频率", () => {
  assert.throws(
    () => normalizeSettings({ targetAt: "2026-07-30T12:00:00", pollInterval: 0 }),
    /正整数/,
  );
});

test("目标时间前保持等待", () => {
  const decision = decideAction({
    nowMs: 1000,
    targetMs: 2000,
    inspection: Object.freeze({ kind: "ready" }),
  });
  assert.deepEqual(decision, { type: "wait-time", remainingMs: 1000 });
});

test("到达时间但按钮未就绪时继续等待", () => {
  const decision = decideAction({
    nowMs: 2000,
    targetMs: 2000,
    inspection: Object.freeze({ kind: "empty" }),
  });
  assert.deepEqual(decision, { type: "wait-button", remainingMs: 0 });
});

test("时间和按钮均就绪时触发", () => {
  const decision = decideAction({
    nowMs: 2000,
    targetMs: 2000,
    inspection: Object.freeze({ kind: "ready" }),
  });
  assert.deepEqual(decision, { type: "trigger", remainingMs: 0 });
});

test("倒计时保留十分之一秒", () => {
  assert.equal(formatCountdown(3_661_987), "01:01:01.9");
  assert.equal(formatCountdown(-1), "00:00:00.0");
});
