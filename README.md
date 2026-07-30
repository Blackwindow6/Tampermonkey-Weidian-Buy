# 微店定时结算助手

一个运行在真实微店购物车页面上的 Tampermonkey 用户脚本。它提供可见的定时面板，持续读取页面当前状态，在目标时间到达且已有商品可结算时，触发一次微店原生结算按钮。

## 当前适配

- 购物车入口：`https://weidian.com/new-cart/index.php`
- 当前生产结构：`.cart_footer_wrap .cart_footer .price_and_btn .go_buy`
- 已选数量：读取微店按钮文本中的 `结算(n)`
- 适配确认日期：2026-07-30

脚本不会直接请求下单接口，也不会接管账号、地址或支付信息。最终下单结果仍由微店页面和服务端决定。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展。
2. 打开 [`weidian-checkout.user.js`](https://raw.githubusercontent.com/Blackwindow6/Tampermonkey-Weidian-Buy/main/weidian-checkout.user.js) 并在 Tampermonkey 安装页确认安装。
3. 在浏览器中登录微店，打开 `https://weidian.com/new-cart/index.php`。

本地开发版本也可以直接把仓库根目录的 `weidian-checkout.user.js` 导入 Tampermonkey。

## 使用

1. 在购物车中勾选准备结算的商品。
2. 在右下角面板设置目标时间，时间精确到秒。
3. 点击“检测按钮”，确认面板显示的已选商品数正确。
4. 点击“开始等待”，并保持购物车标签页处于前台。
5. 到达目标时间后，脚本会在按钮可用时点击一次并自动停止。

若目标时间已过，脚本会立即进入按钮检查状态；若商品尚不可结算，它会持续显示真实原因并继续检查，直到用户停止或按钮可用。

## 状态说明

| 状态 | 含义 |
| --- | --- |
| 等待目标时间 | 页面按钮已检测，尚未到设定时间 |
| 已到时间，等待可结算 | 时间已到，但未选商品、按钮不可用或页面仍在加载 |
| 已触发结算 | 已调用微店原生按钮的单次点击 |
| 运行错误 | 配置无效、出现多个候选按钮或页面结构无法可靠判断 |

脚本配置保存在 Tampermonkey 存储中。刷新购物车后，目标时间和检查频率仍会保留。

## 使用边界

- 不绕过登录、验证码、风控、库存校验或平台限购。
- 不自动确认收货地址，不自动付款。
- 浏览器会限制后台标签页的计时精度，抢购前应保持页面在前台且设备时间准确。
- 微店改版后若定位失败，面板会明确显示“未找到购物车结算按钮”，不会猜测点击其他元素。

## 开发与验证

```bash
npm install
npm run build
npm test
npm run test:e2e
npm run verify:live
```

- `src/core.js`：时间、配置和状态决策
- `src/dom.js`：真实购物车按钮识别与点击
- `src/controller.js`：调度生命周期
- `src/ui.js`：Shadow DOM 控制面板
- `demo/index.html`：当前生产 DOM 形状的浏览器演示页
- `scripts/verify-live.mjs`：线上入口、生产 bundle 和脚本注入烟测
- `weidian-checkout.user.js`：构建生成、可直接安装和自动更新的用户脚本
