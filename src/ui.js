import { formatLogTime, POLL_INTERVALS, toDateTimeLocal } from "./core.js";
import { PANEL_STYLES } from "./styles.js";

const MAX_LOG_ITEMS = 4;
const APP_VERSION = __APP_VERSION__;

function panelTemplate(settings) {
  const intervals = POLL_INTERVALS.map((value) => `
    <label><input type="radio" name="interval" value="${value}"><span>${value / 1000} 秒</span></label>`).join("");
  return `
    <section class="wb-shell" data-phase="idle">
      <header class="wb-header">
        <span class="wb-mark" aria-hidden="true">W</span>
        <span class="wb-heading"><strong class="wb-title">微店结算助手</strong><small class="wb-version">v${APP_VERSION}</small></span>
        <button class="wb-icon-btn" type="button" data-action="collapse" title="收起面板" aria-label="收起面板">−</button>
      </header>
      <div class="wb-body">
        <section class="wb-status" aria-live="polite">
          <span class="wb-status-dot" aria-hidden="true"></span>
          <span class="wb-status-copy"><strong class="wb-status-title">尚未启动</strong><small class="wb-status-detail">等待检测结算按钮</small></span>
          <output class="wb-countdown">--:--:--.-</output>
        </section>
        <div class="wb-form">
          <div>
            <div class="wb-label-row"><label class="wb-label" for="wb-target-at">目标时间</label><button class="wb-link-btn" type="button" data-action="now">设为现在</button></div>
            <input class="wb-date" id="wb-target-at" type="datetime-local" step="1" value="${settings.targetAt}">
          </div>
          <div>
            <div class="wb-label-row"><span class="wb-label">检查频率</span></div>
            <div class="wb-segments" role="radiogroup" aria-label="检查频率">${intervals}</div>
          </div>
          <div class="wb-actions">
            <button class="wb-button" type="button" data-action="probe">检测按钮</button>
            <button class="wb-button wb-button-primary" type="button" data-action="start">开始等待</button>
            <button class="wb-button" type="button" data-action="stop" disabled>停止</button>
          </div>
        </div>
        <div class="wb-meta">
          <div class="wb-meta-item"><span class="wb-meta-label">已选商品</span><strong class="wb-meta-value" data-field="count">--</strong></div>
          <div class="wb-meta-item"><span class="wb-meta-label">页面定位</span><strong class="wb-meta-value" data-field="selector">等待检测</strong></div>
        </div>
        <ol class="wb-log" aria-label="运行记录"></ol>
      </div>
    </section>`;
}

function required(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`控制面板元素缺失：${selector}`);
  return element;
}

class CheckoutPanel {
  constructor(options) {
    this.document = options.document;
    this.handlers = options.handlers;
    this.clock = options.clock;
    this.armed = false;
    this.lastInspectionKey = "";
    this.createHost(options.settings);
    this.cacheElements(options.settings);
    this.bindActions();
    this.addLog("助手已加载");
  }

  createHost(settings) {
    this.host = this.document.createElement("aside");
    this.host.id = "wb-checkout-assistant";
    this.host.setAttribute("aria-label", "微店结算助手");
    this.root = this.host.attachShadow({ mode: "open" });
    this.root.innerHTML = `<style>${PANEL_STYLES}</style>${panelTemplate(settings)}`;
    this.document.body.append(this.host);
  }

  cacheElements(settings) {
    this.shell = required(this.root, ".wb-shell");
    this.targetInput = required(this.root, "#wb-target-at");
    this.startButton = required(this.root, '[data-action="start"]');
    this.stopButton = required(this.root, '[data-action="stop"]');
    this.log = required(this.root, ".wb-log");
    required(this.root, `input[name="interval"][value="${settings.pollInterval}"]`).checked = true;
  }

  addLog(message) {
    const item = this.document.createElement("li");
    const time = this.document.createElement("time");
    const content = this.document.createElement("span");
    time.textContent = formatLogTime(this.clock());
    content.textContent = message;
    item.append(time, content);
    this.log.prepend(item);
    while (this.log.children.length > MAX_LOG_ITEMS) this.log.lastElementChild.remove();
  }

  setStatus(options) {
    const { phase, title, detail, countdown = "--:--:--.-" } = options;
    this.shell.dataset.phase = phase;
    required(this.root, ".wb-status-title").textContent = title;
    required(this.root, ".wb-status-detail").textContent = detail;
    required(this.root, ".wb-countdown").textContent = countdown;
  }

  setArmed(nextArmed) {
    this.armed = nextArmed;
    this.targetInput.disabled = nextArmed;
    this.root.querySelectorAll('input[name="interval"]').forEach((input) => { input.disabled = nextArmed; });
    this.startButton.disabled = nextArmed;
    this.stopButton.disabled = !nextArmed;
  }

  readSettings() {
    const selected = required(this.root, 'input[name="interval"]:checked');
    return Object.freeze({ targetAt: this.targetInput.value, pollInterval: Number(selected.value) });
  }

  renderInspection(inspection) {
    required(this.root, '[data-field="count"]').textContent = inspection.count ?? "--";
    const selector = required(this.root, '[data-field="selector"]');
    selector.textContent = inspection.selector || "未定位";
    selector.title = inspection.selector || inspection.reason;
    const key = `${inspection.kind}:${inspection.count}:${inspection.reason}`;
    if (key !== this.lastInspectionKey) {
      this.addLog(inspection.reason);
      this.lastInspectionKey = key;
    }
    if (!this.armed) this.renderInspectionStatus(inspection);
  }

  renderInspectionStatus(inspection) {
    const states = {
      ready: ["ready", "结算按钮可用"],
      empty: ["idle", "等待勾选商品"],
      disabled: ["idle", "结算按钮不可用"],
      missing: ["error", "未定位结算按钮"],
      invalid: ["error", "无法确认按钮状态"],
    };
    const [phase, title] = states[inspection.kind];
    this.setStatus({ phase, title, detail: inspection.reason });
  }

  renderArmed() {
    this.setArmed(true);
    this.setStatus({ phase: "armed", title: "等待目标时间", detail: "持续检查页面状态" });
    this.addLog("定时任务已启动");
  }

  renderWaiting(state) {
    const title = state.waitingForButton ? "已到时间，等待可结算" : "等待目标时间";
    const phase = state.inspection.kind === "ready" ? "ready" : "armed";
    this.setStatus({ phase, title, detail: state.inspection.reason, countdown: state.countdown });
  }

  renderTriggered(inspection) {
    this.setArmed(false);
    this.setStatus({ phase: "triggered", title: "已触发结算", detail: inspection.label, countdown: "00:00:00.0" });
    this.addLog(`已点击：${inspection.label}`);
  }

  renderStopped() {
    this.setArmed(false);
    this.setStatus({ phase: "idle", title: "任务已停止", detail: "未执行结算" });
    this.addLog("任务已手动停止");
  }

  renderError(error) {
    this.setArmed(false);
    this.setStatus({ phase: "error", title: "运行错误", detail: error.message });
    this.addLog(`错误：${error.message}`);
  }

  toggleCollapsed(button) {
    const collapsed = this.shell.classList.toggle("is-collapsed");
    button.textContent = collapsed ? "+" : "−";
    button.title = collapsed ? "展开面板" : "收起面板";
  }

  bindActions() {
    required(this.root, '[data-action="collapse"]').addEventListener("click", (event) => this.toggleCollapsed(event.currentTarget));
    required(this.root, '[data-action="now"]').addEventListener("click", () => {
      this.targetInput.value = toDateTimeLocal(this.clock());
    });
    required(this.root, '[data-action="probe"]').addEventListener("click", this.handlers.probe);
    this.startButton.addEventListener("click", () => this.handlers.start(this.readSettings()));
    this.stopButton.addEventListener("click", this.handlers.stop);
  }
}

export function createPanel(options) {
  return new CheckoutPanel(options);
}
