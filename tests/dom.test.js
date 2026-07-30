import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { inspectCheckout, triggerCheckout } from "../src/dom.js";

function createCart(buttonHtml = "") {
  return new JSDOM(`<!doctype html><body>
    <div class="cart_footer_wrap">
      <div class="cart_footer">
        <div class="price_and_btn">${buttonHtml}</div>
      </div>
    </div>
  </body>`, { pretendToBeVisual: true });
}

test("识别生产购物车的结算按钮和商品数", () => {
  const dom = createCart('<div class="go_buy wd-theme__button1">结算(2)</div>');
  const inspection = inspectCheckout(dom.window.document);
  assert.equal(inspection.kind, "ready");
  assert.equal(inspection.count, 2);
  assert.equal(inspection.selector, ".cart_footer_wrap .cart_footer .price_and_btn .go_buy");
});

test("兼容全角商品数量括号", () => {
  const dom = createCart('<div class="go_buy wd-theme__button1">结算（12）</div>');
  assert.equal(inspectCheckout(dom.window.document).count, 12);
});

test("没有勾选商品时不进入就绪状态", () => {
  const dom = createCart('<div class="go_buy wd-theme__button1">结算(0)</div>');
  const inspection = inspectCheckout(dom.window.document);
  assert.equal(inspection.kind, "empty");
  assert.match(inspection.reason, /没有勾选/);
});

test("禁用按钮不会被判定为可点击", () => {
  const dom = createCart('<div class="go_buy is-disabled" aria-disabled="true">结算(1)</div>');
  assert.equal(inspectCheckout(dom.window.document).kind, "disabled");
});

test("页面结构缺失时给出明确状态", () => {
  const dom = new JSDOM("<!doctype html><body></body>");
  const inspection = inspectCheckout(dom.window.document);
  assert.equal(inspection.kind, "missing");
  assert.match(inspection.reason, /未找到购物车结算按钮/);
});

test("仅对就绪按钮触发一次原生点击", () => {
  const dom = createCart('<div class="go_buy wd-theme__button1">结算(1)</div>');
  const inspection = inspectCheckout(dom.window.document);
  let clicks = 0;
  inspection.button.addEventListener("click", () => { clicks += 1; });
  triggerCheckout(inspection);
  assert.equal(clicks, 1);
});

test("多个结算目标会中止而不是猜测", () => {
  const buttons = '<div class="go_buy">结算(1)</div><div class="go_buy">结算(2)</div>';
  const dom = createCart(buttons);
  assert.throws(() => inspectCheckout(dom.window.document), /检测到 2 个结算按钮/);
});
