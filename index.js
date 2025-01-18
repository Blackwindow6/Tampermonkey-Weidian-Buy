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
