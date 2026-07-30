import test from "node:test";
import assert from "node:assert/strict";
import { createController } from "../src/controller.js";
import { toDateTimeLocal } from "../src/core.js";

function createView() {
  const calls = [];
  const record = (name) => (...args) => calls.push([name, ...args]);
  return {
    calls,
    renderInspection: record("inspection"),
    renderArmed: record("armed"),
    renderWaiting: record("waiting"),
    renderTriggered: record("triggered"),
    renderStopped: record("stopped"),
    renderError: record("error"),
  };
}

function createScheduler() {
  let scheduled = null;
  return {
    schedule(callback, delayMs) {
      scheduled = { callback, delayMs };
      return 1;
    },
    cancel() {
      scheduled = null;
    },
    getScheduled: () => scheduled,
  };
}

test("时间到达后只触发一次并自动解除任务", () => {
  const nowMs = new Date(2026, 6, 30, 14, 0, 0).getTime();
  const view = createView();
  const scheduler = createScheduler();
  let clicks = 0;
  const controller = createController({
    clock: () => nowMs,
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
    inspect: () => Object.freeze({ kind: "ready", count: 1, label: "结算(1)" }),
    trigger: () => { clicks += 1; },
    view,
    reportError: assert.fail,
  });

  controller.start({ targetAt: toDateTimeLocal(nowMs), pollInterval: 100 });
  assert.equal(clicks, 1);
  assert.equal(controller.getRuntime().armed, false);
  assert.equal(scheduler.getScheduled(), null);
  assert.equal(view.calls.at(-1)[0], "triggered");
});

test("时间已到但未选商品时继续检查", () => {
  const nowMs = new Date(2026, 6, 30, 14, 0, 0).getTime();
  const view = createView();
  const scheduler = createScheduler();
  const controller = createController({
    clock: () => nowMs,
    schedule: scheduler.schedule,
    cancel: scheduler.cancel,
    inspect: () => Object.freeze({ kind: "empty", count: 0, reason: "当前没有勾选可结算商品" }),
    trigger: assert.fail,
    view,
    reportError: assert.fail,
  });

  controller.start({ targetAt: toDateTimeLocal(nowMs), pollInterval: 250 });
  assert.equal(controller.getRuntime().armed, true);
  assert.equal(scheduler.getScheduled().delayMs, 250);
  assert.equal(view.calls.at(-1)[0], "waiting");
});
