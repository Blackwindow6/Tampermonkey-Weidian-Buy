# Tampermonkey-Weidian-Buy
一个简单的油猴脚本，帮助用户在微店平台购物车页面上自动进行抢购操作。当商品到达结算时间并且按钮可用时，脚本会自动点击结算按钮，提升抢购的成功率。
## 功能

- 每隔一定时间检查一次商品是否可以购买。
- 当商品到达购买时间且结算按钮可点击时，自动触发点击事件。
- 可自定义检查频率和页面 URL。

## 安装步骤

### 1. 安装油猴插件

首先，您需要安装油猴（Tampermonkey）或 Greasemonkey 插件：

- [Tampermonkey 插件 (Chrome)](https://tampermonkey.net/)
- [Greasemonkey 插件 (Firefox)](https://www.greasespot.net/)

### 2. 创建油猴脚本

1. 安装好插件后，点击浏览器插件图标。
2. 选择 "创建新脚本"。
3. 在弹出的脚本编辑器中删除默认的代码，将以下代码粘贴进去：

```javascript
// ==UserScript==
// @name         微店购物车结算脚本
// @namespace    
// @version      1
// @description  微店自动抢
// @author       Blackwindow6
// @match        *://weidian.com/new-cart/*
// @icon         https://s1.ax1x.com/2022/10/14/xwsJYT.png
// @grant        none

(function() {
    'use strict';

    // 设置检查间隔时间（例如每0.1秒检查一次）
    const checkInterval = 100;  // 每100毫秒检查一次

    // 自动结算的函数
    function autoCheckout() {
        // 获取结算按钮
        const checkoutButton = document.querySelector('.go_buy.wd-theme__button1');

        // 如果结算按钮存在且没有被禁用，模拟点击操作
        if (checkoutButton && !checkoutButton.disabled) {
            console.log('商品可以购买，自动点击结算按钮');
            
            // 使用 MouseEvent 模拟点击操作
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            checkoutButton.dispatchEvent(clickEvent);
        } else {
            console.log('商品尚未到点或不可购买');
        }
    }

    // 定时器每隔 checkInterval 毫秒调用一次 autoCheckout 函数
    setInterval(autoCheckout, checkInterval);
})();

### 说明：
1. **项目名称**：`微店自动抢购脚本`。
2. **安装步骤**：提供了从安装油猴插件到创建和启用脚本的详细步骤。
3. **配置选项**：提到检查间隔时间和 URL 匹配的配置，方便用户根据需要修改。
4. **注意事项**：提醒用户遵循合法和合规的使用规则。

