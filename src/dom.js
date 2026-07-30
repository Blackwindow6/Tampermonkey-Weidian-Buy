const CHECKOUT_SELECTORS = Object.freeze([
  ".cart_footer_wrap .cart_footer .price_and_btn .go_buy",
  ".cart_footer_wrap .go_buy.wd-theme__button1",
  ".cart_footer_wrap .go_buy",
]);
const DISABLED_CLASS_PATTERN = /(^|[\s_-])(disabled?|unavailable)(?=$|[\s_-])/i;
const COUNT_PATTERN = /[（(]\s*(\d+)\s*[）)]\s*$/;

function normalizeText(element) {
  return String(element.textContent || "").replace(/\s+/g, " ").trim();
}

function isDeleteAction(element) {
  return normalizeText(element).startsWith("删除");
}

function locateByStrategy(root) {
  for (const selector of CHECKOUT_SELECTORS) {
    const candidates = [...root.querySelectorAll(selector)].filter((item) => !isDeleteAction(item));
    if (candidates.length > 1) {
      throw new Error(`检测到 ${candidates.length} 个结算按钮，无法确定点击目标`);
    }
    if (candidates.length === 1) {
      return Object.freeze({ button: candidates[0], selector });
    }
  }
  return null;
}

function isHidden(element) {
  if (element.hidden || element.closest('[hidden], [aria-hidden="true"]')) {
    return true;
  }
  const view = element.ownerDocument?.defaultView;
  const style = view?.getComputedStyle(element);
  return style?.display === "none" || style?.visibility === "hidden";
}

function isDisabled(element) {
  const className = typeof element.className === "string" ? element.className : "";
  return Boolean(
    element.disabled
      || element.hasAttribute("disabled")
      || element.getAttribute("aria-disabled") === "true"
      || DISABLED_CLASS_PATTERN.test(className)
      || isHidden(element),
  );
}

function buildInspection(kind, values) {
  return Object.freeze({ kind, count: null, label: "", selector: "", button: null, ...values });
}

export function inspectCheckout(root) {
  const located = locateByStrategy(root);
  if (!located) {
    return buildInspection("missing", {
      reason: "未找到购物车结算按钮，页面可能未加载完成或微店结构已变化",
    });
  }

  const label = normalizeText(located.button);
  const countMatch = COUNT_PATTERN.exec(label);
  const base = { ...located, label };
  if (!countMatch) {
    return buildInspection("invalid", { ...base, reason: `无法识别按钮中的商品数量：${label || "空文本"}` });
  }

  const count = Number(countMatch[1]);
  if (count === 0) {
    return buildInspection("empty", { ...base, count, reason: "当前没有勾选可结算商品" });
  }
  if (isDisabled(located.button)) {
    return buildInspection("disabled", { ...base, count, reason: "结算按钮当前不可用" });
  }
  return buildInspection("ready", { ...base, count, reason: `已识别 ${count} 件待结算商品` });
}

export function triggerCheckout(inspection) {
  if (inspection.kind !== "ready" || !inspection.button?.isConnected) {
    throw new Error("结算按钮状态已变化，本次未执行点击");
  }
  inspection.button.click();
}
