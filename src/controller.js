import { decideAction, formatCountdown, normalizeSettings, parseTargetAt } from "./core.js";

function createRuntime() {
  return Object.freeze({ armed: false, timerId: null, settings: null, targetMs: null });
}

class CheckoutController {
  constructor(options) {
    this.clock = options.clock;
    this.schedule = options.schedule;
    this.cancel = options.cancel;
    this.inspect = options.inspect;
    this.trigger = options.trigger;
    this.view = options.view;
    this.reportError = options.reportError;
    this.runtime = createRuntime();
  }

  updateRuntime(patch) {
    this.runtime = Object.freeze({ ...this.runtime, ...patch });
  }

  clearScheduled() {
    if (this.runtime.timerId === null) return;
    this.cancel(this.runtime.timerId);
    this.updateRuntime({ timerId: null });
  }

  fail(error) {
    this.clearScheduled();
    this.updateRuntime({ armed: false });
    this.view.renderError(error);
    this.reportError(error);
  }

  probe() {
    try {
      const inspection = this.inspect();
      this.view.renderInspection(inspection);
      return inspection;
    } catch (error) {
      this.fail(error);
      return null;
    }
  }

  scheduleNext(delayMs) {
    const timerId = this.schedule(() => this.tick(), delayMs);
    this.updateRuntime({ timerId });
  }

  tick() {
    if (!this.runtime.armed) return;
    this.updateRuntime({ timerId: null });
    const inspection = this.probe();
    if (!inspection || !this.runtime.armed) return;

    const decision = decideAction({
      nowMs: this.clock(),
      targetMs: this.runtime.targetMs,
      inspection,
    });
    if (decision.type === "trigger") {
      this.execute(inspection);
      return;
    }

    this.view.renderWaiting({
      countdown: formatCountdown(decision.remainingMs),
      inspection,
      waitingForButton: decision.type === "wait-button",
    });
    const delayMs = decision.remainingMs || this.runtime.settings.pollInterval;
    this.scheduleNext(Math.min(this.runtime.settings.pollInterval, delayMs));
  }

  execute(inspection) {
    try {
      this.trigger(inspection);
      this.clearScheduled();
      this.updateRuntime({ armed: false });
      this.view.renderTriggered(inspection);
    } catch (error) {
      this.fail(error);
    }
  }

  start(value) {
    try {
      const settings = normalizeSettings(value);
      this.clearScheduled();
      this.updateRuntime({ armed: true, settings, targetMs: parseTargetAt(settings.targetAt) });
      this.view.renderArmed(settings);
      this.tick();
    } catch (error) {
      this.fail(error);
    }
  }

  stop() {
    this.clearScheduled();
    this.updateRuntime({ armed: false });
    this.view.renderStopped();
  }

  destroy() {
    this.clearScheduled();
    this.runtime = createRuntime();
  }

  getRuntime() {
    return this.runtime;
  }
}

export function createController(options) {
  return new CheckoutController(options);
}
