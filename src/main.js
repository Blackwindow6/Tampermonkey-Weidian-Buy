import { createController } from "./controller.js";
import { createDefaultSettings, normalizeSettings } from "./core.js";
import { inspectCheckout, triggerCheckout } from "./dom.js";
import { createPanel } from "./ui.js";

const STORAGE_KEY = "weidian-checkout-assistant:settings:v2";
const HOST_ID = "wb-checkout-assistant";

function createStore(options) {
  const { getValue, setValue, clock } = options;
  return Object.freeze({
    load() {
      const value = getValue(STORAGE_KEY, null);
      return value === null ? createDefaultSettings(clock()) : normalizeSettings(value);
    },
    save(value) {
      const settings = normalizeSettings(value);
      setValue(STORAGE_KEY, settings);
      return settings;
    },
  });
}

export function boot(options) {
  const { document, clock, schedule, cancel, getValue, setValue, reportError } = options;
  if (document.getElementById(HOST_ID)) return null;

  const store = createStore({ getValue, setValue, clock });
  const settings = store.load();
  let controller;
  const panel = createPanel({
    document,
    settings,
    clock,
    handlers: {
      probe: () => controller.probe(),
      start: (value) => {
        try {
          controller.start(store.save(value));
        } catch (error) {
          panel.renderError(error);
          reportError(error);
        }
      },
      stop: () => controller.stop(),
    },
  });

  controller = createController({
    clock,
    schedule,
    cancel,
    inspect: () => inspectCheckout(document),
    trigger: triggerCheckout,
    view: panel,
    reportError,
  });
  controller.probe();
  window.addEventListener("beforeunload", controller.destroy, { once: true });
  return controller;
}

function assertUserscriptApi(name, value) {
  if (typeof value !== "function") throw new Error(`Tampermonkey API 不可用：${name}`);
  return value;
}

boot({
  document,
  clock: () => Date.now(),
  schedule: (callback, delayMs) => window.setTimeout(callback, delayMs),
  cancel: (timerId) => window.clearTimeout(timerId),
  getValue: assertUserscriptApi("GM_getValue", GM_getValue),
  setValue: assertUserscriptApi("GM_setValue", GM_setValue),
  reportError: (error) => console.error("[微店结算助手]", error),
});
