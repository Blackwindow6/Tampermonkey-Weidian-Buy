// ==UserScript==
// @name         微店定时结算助手
// @namespace    https://github.com/Blackwindow6/Tampermonkey-Weidian-Buy
// @version      2.0.0
// @description  在微店购物车按设定时间触发一次结算，并显示真实页面状态
// @author       Blackwindow6
// @match        https://weidian.com/new-cart/index.php*
// @match        https://www.weidian.com/new-cart/index.php*
// @icon         https://s.geilicdn.com/user/images/favicon.ico
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @homepageURL  https://github.com/Blackwindow6/Tampermonkey-Weidian-Buy
// @supportURL   https://github.com/Blackwindow6/Tampermonkey-Weidian-Buy/issues
// @updateURL    https://raw.githubusercontent.com/Blackwindow6/Tampermonkey-Weidian-Buy/main/weidian-checkout.user.js
// @downloadURL  https://raw.githubusercontent.com/Blackwindow6/Tampermonkey-Weidian-Buy/main/weidian-checkout.user.js
// ==/UserScript==
(()=>{var S=Object.freeze([100,250,500]);function l(r,t=2){return String(r).padStart(t,"0")}function w(r){let t=new Date(r),e=[t.getFullYear(),l(t.getMonth()+1),l(t.getDate())].join("-"),o=[l(t.getHours()),l(t.getMinutes()),l(t.getSeconds())].join(":");return`${e}T${o}`}function E(r){return Object.freeze({targetAt:w(r+3e5),pollInterval:100})}function x(r){let e=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(r).trim());if(!e)throw new Error("\u76EE\u6807\u65F6\u95F4\u683C\u5F0F\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u65E5\u671F\u548C\u65F6\u95F4");let o=e.slice(1).map(d=>Number(d||0)),[s,i,g,p,h,f]=o,n=new Date(s,i-1,g,p,h,f);if([n.getFullYear(),n.getMonth()+1,n.getDate(),n.getHours(),n.getMinutes(),n.getSeconds()].some((d,b)=>d!==o[b]))throw new Error("\u76EE\u6807\u65F6\u95F4\u4E0D\u5B58\u5728\uFF0C\u8BF7\u68C0\u67E5\u65E5\u671F\u548C\u65F6\u95F4");return n.getTime()}function c(r){if(!r||typeof r!="object")throw new Error("\u7ED3\u7B97\u914D\u7F6E\u65E0\u6548");let t=String(r.targetAt||"").trim(),e=Number(r.pollInterval);if(x(t),!Number.isInteger(e)||e<=0)throw new Error("\u68C0\u67E5\u9891\u7387\u5FC5\u987B\u662F\u6B63\u6574\u6570\u6BEB\u79D2\u503C");return Object.freeze({targetAt:t,pollInterval:e})}function k(r){let{nowMs:t,targetMs:e,inspection:o}=r;return t<e?Object.freeze({type:"wait-time",remainingMs:e-t}):o.kind!=="ready"?Object.freeze({type:"wait-button",remainingMs:0}):Object.freeze({type:"trigger",remainingMs:0})}function _(r){let t=Math.max(0,r),e=Math.floor(t/36e5),o=Math.floor(t%36e5/6e4),s=Math.floor(t%6e4/1e3),i=Math.floor(t%1e3/(1e3/10));return`${l(e)}:${l(o)}:${l(s)}.${i}`}function M(r){let t=new Date(r);return`${l(t.getHours())}:${l(t.getMinutes())}:${l(t.getSeconds())}`}function L(){return Object.freeze({armed:!1,timerId:null,settings:null,targetMs:null})}var y=class{constructor(t){this.clock=t.clock,this.schedule=t.schedule,this.cancel=t.cancel,this.inspect=t.inspect,this.trigger=t.trigger,this.view=t.view,this.reportError=t.reportError,this.runtime=L()}updateRuntime(t){this.runtime=Object.freeze({...this.runtime,...t})}clearScheduled(){this.runtime.timerId!==null&&(this.cancel(this.runtime.timerId),this.updateRuntime({timerId:null}))}fail(t){this.clearScheduled(),this.updateRuntime({armed:!1}),this.view.renderError(t),this.reportError(t)}probe(){try{let t=this.inspect();return this.view.renderInspection(t),t}catch(t){return this.fail(t),null}}scheduleNext(t){let e=this.schedule(()=>this.tick(),t);this.updateRuntime({timerId:e})}tick(){if(!this.runtime.armed)return;this.updateRuntime({timerId:null});let t=this.probe();if(!t||!this.runtime.armed)return;let e=k({nowMs:this.clock(),targetMs:this.runtime.targetMs,inspection:t});if(e.type==="trigger"){this.execute(t);return}this.view.renderWaiting({countdown:_(e.remainingMs),inspection:t,waitingForButton:e.type==="wait-button"});let o=e.remainingMs||this.runtime.settings.pollInterval;this.scheduleNext(Math.min(this.runtime.settings.pollInterval,o))}execute(t){try{this.trigger(t),this.clearScheduled(),this.updateRuntime({armed:!1}),this.view.renderTriggered(t)}catch(e){this.fail(e)}}start(t){try{let e=c(t);this.clearScheduled(),this.updateRuntime({armed:!0,settings:e,targetMs:x(e.targetAt)}),this.view.renderArmed(e),this.tick()}catch(e){this.fail(e)}}stop(){this.clearScheduled(),this.updateRuntime({armed:!1}),this.view.renderStopped()}destroy(){this.clearScheduled(),this.runtime=L()}getRuntime(){return this.runtime}};function A(r){return new y(r)}var D=Object.freeze([".cart_footer_wrap .cart_footer .price_and_btn .go_buy",".cart_footer_wrap .go_buy.wd-theme__button1",".cart_footer_wrap .go_buy"]),R=/(^|[\s_-])(disabled?|unavailable)(?=$|[\s_-])/i,j=/[（(]\s*(\d+)\s*[）)]\s*$/;function I(r){return String(r.textContent||"").replace(/\s+/g," ").trim()}function V(r){return I(r).startsWith("\u5220\u9664")}function P(r){for(let t of D){let e=[...r.querySelectorAll(t)].filter(o=>!V(o));if(e.length>1)throw new Error(`\u68C0\u6D4B\u5230 ${e.length} \u4E2A\u7ED3\u7B97\u6309\u94AE\uFF0C\u65E0\u6CD5\u786E\u5B9A\u70B9\u51FB\u76EE\u6807`);if(e.length===1)return Object.freeze({button:e[0],selector:t})}return null}function U(r){if(r.hidden||r.closest('[hidden], [aria-hidden="true"]'))return!0;let e=r.ownerDocument?.defaultView?.getComputedStyle(r);return e?.display==="none"||e?.visibility==="hidden"}function H(r){let t=typeof r.className=="string"?r.className:"";return!!(r.disabled||r.hasAttribute("disabled")||r.getAttribute("aria-disabled")==="true"||R.test(t)||U(r))}function u(r,t){return Object.freeze({kind:r,count:null,label:"",selector:"",button:null,...t})}function T(r){let t=P(r);if(!t)return u("missing",{reason:"\u672A\u627E\u5230\u8D2D\u7269\u8F66\u7ED3\u7B97\u6309\u94AE\uFF0C\u9875\u9762\u53EF\u80FD\u672A\u52A0\u8F7D\u5B8C\u6210\u6216\u5FAE\u5E97\u7ED3\u6784\u5DF2\u53D8\u5316"});let e=I(t.button),o=j.exec(e),s={...t,label:e};if(!o)return u("invalid",{...s,reason:`\u65E0\u6CD5\u8BC6\u522B\u6309\u94AE\u4E2D\u7684\u5546\u54C1\u6570\u91CF\uFF1A${e||"\u7A7A\u6587\u672C"}`});let i=Number(o[1]);return i===0?u("empty",{...s,count:i,reason:"\u5F53\u524D\u6CA1\u6709\u52FE\u9009\u53EF\u7ED3\u7B97\u5546\u54C1"}):H(t.button)?u("disabled",{...s,count:i,reason:"\u7ED3\u7B97\u6309\u94AE\u5F53\u524D\u4E0D\u53EF\u7528"}):u("ready",{...s,count:i,reason:`\u5DF2\u8BC6\u522B ${i} \u4EF6\u5F85\u7ED3\u7B97\u5546\u54C1`})}function z(r){if(r.kind!=="ready"||!r.button?.isConnected)throw new Error("\u7ED3\u7B97\u6309\u94AE\u72B6\u6001\u5DF2\u53D8\u5316\uFF0C\u672C\u6B21\u672A\u6267\u884C\u70B9\u51FB");r.button.click()}var O=`
:host {
  all: initial;
  position: fixed;
  right: 20px;
  bottom: 24px;
  z-index: 2147483646;
  color: #202124;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
* { box-sizing: border-box; letter-spacing: 0; }
button, input { font: inherit; }
button { -webkit-tap-highlight-color: transparent; }
.wb-shell {
  width: 344px;
  overflow: hidden;
  border: 1px solid #dedede;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 42px rgba(22, 24, 28, .18), 0 2px 8px rgba(22, 24, 28, .08);
}
.wb-header {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 10px 12px 10px 14px;
  border-bottom: 1px solid #ececec;
  background: #202124;
  color: #ffffff;
}
.wb-mark {
  display: grid;
  width: 32px;
  height: 32px;
  margin-right: 10px;
  place-items: center;
  border-radius: 6px;
  background: #e1251b;
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: 700;
}
.wb-heading { min-width: 0; flex: 1; }
.wb-title { display: block; overflow: hidden; font-size: 14px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.wb-version { color: #afb2b7; font-size: 11px; }
.wb-icon-btn {
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #d7d9dc;
  cursor: pointer;
  font-size: 20px;
}
.wb-icon-btn:hover { background: #34363a; color: #ffffff; }
.wb-body { max-height: calc(100vh - 112px); overflow: auto; }
.wb-status { display: grid; grid-template-columns: 11px 1fr auto; gap: 10px; align-items: center; padding: 16px; border-bottom: 1px solid #ececec; }
.wb-status-dot { width: 9px; height: 9px; border-radius: 50%; background: #909399; box-shadow: 0 0 0 4px #f0f1f2; }
.wb-status-copy { min-width: 0; }
.wb-status-title { display: block; color: #202124; font-size: 14px; font-weight: 700; }
.wb-status-detail { display: block; overflow: hidden; margin-top: 1px; color: #777b82; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.wb-countdown { color: #202124; font-family: "DIN Alternate", Consolas, monospace; font-size: 17px; font-variant-numeric: tabular-nums; font-weight: 700; }
.wb-shell[data-phase="armed"] .wb-status-dot { background: #e6a23c; box-shadow: 0 0 0 4px #fff3dc; }
.wb-shell[data-phase="ready"] .wb-status-dot { background: #14804a; box-shadow: 0 0 0 4px #ddf4e8; }
.wb-shell[data-phase="triggered"] .wb-status-dot { background: #e1251b; box-shadow: 0 0 0 4px #fde4e2; }
.wb-shell[data-phase="error"] .wb-status-dot { background: #c62828; box-shadow: 0 0 0 4px #fde6e6; }
.wb-form { display: grid; gap: 14px; padding: 16px; }
.wb-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.wb-label { color: #4d5055; font-size: 12px; font-weight: 700; }
.wb-link-btn { padding: 2px 0; border: 0; background: transparent; color: #c91b14; cursor: pointer; font-size: 12px; }
.wb-date {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #d7d8da;
  border-radius: 6px;
  outline: none;
  background: #ffffff;
  color: #202124;
  font-variant-numeric: tabular-nums;
}
.wb-date:focus { border-color: #202124; box-shadow: 0 0 0 2px rgba(32, 33, 36, .10); }
.wb-segments { display: grid; grid-template-columns: repeat(3, 1fr); height: 38px; overflow: hidden; border: 1px solid #d7d8da; border-radius: 6px; }
.wb-segments label { position: relative; display: grid; place-items: center; border-right: 1px solid #d7d8da; cursor: pointer; }
.wb-segments label:last-child { border-right: 0; }
.wb-segments input { position: absolute; opacity: 0; pointer-events: none; }
.wb-segments span { display: grid; width: 100%; height: 100%; place-items: center; color: #64676c; font-size: 12px; }
.wb-segments input:checked + span { background: #202124; color: #ffffff; font-weight: 700; }
.wb-actions { display: grid; grid-template-columns: 1fr 1.2fr .78fr; gap: 8px; }
.wb-button { height: 42px; border: 1px solid #d4d5d7; border-radius: 6px; background: #ffffff; color: #292b2f; cursor: pointer; font-weight: 700; }
.wb-button:hover { border-color: #909399; background: #f7f7f7; }
.wb-button-primary { border-color: #e1251b; background: #e1251b; color: #ffffff; }
.wb-button-primary:hover { border-color: #c91b14; background: #c91b14; }
.wb-button:disabled, .wb-date:disabled { cursor: not-allowed; opacity: .48; }
.wb-meta { display: grid; grid-template-columns: 90px 1fr; border-top: 1px solid #ececec; border-bottom: 1px solid #ececec; }
.wb-meta-item { min-width: 0; padding: 11px 14px; }
.wb-meta-item + .wb-meta-item { border-left: 1px solid #ececec; }
.wb-meta-label { display: block; color: #909399; font-size: 10px; }
.wb-meta-value { display: block; overflow: hidden; margin-top: 2px; color: #383b40; font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.wb-log { margin: 0; padding: 10px 14px 12px; list-style: none; background: #fafafa; color: #71757b; font-size: 11px; }
.wb-log li { display: grid; grid-template-columns: 58px 1fr; gap: 4px; min-height: 20px; }
.wb-log time { color: #a0a3a8; font-family: Consolas, monospace; font-variant-numeric: tabular-nums; }
.wb-shell.is-collapsed { width: 226px; }
.wb-shell.is-collapsed .wb-header { border-bottom: 0; }
.wb-shell.is-collapsed .wb-body { display: none; }
@media (max-width: 760px) {
  :host { right: 12px; bottom: 98px; left: 12px; }
  .wb-shell, .wb-shell.is-collapsed { width: 100%; }
  .wb-shell.is-collapsed { width: 226px; margin-left: auto; }
  .wb-body { max-height: calc(100vh - 176px); }
}
`;var B=4,F="2.0.0";function G(r){let t=S.map(e=>`
    <label><input type="radio" name="interval" value="${e}"><span>${e/1e3} \u79D2</span></label>`).join("");return`
    <section class="wb-shell" data-phase="idle">
      <header class="wb-header">
        <span class="wb-mark" aria-hidden="true">W</span>
        <span class="wb-heading"><strong class="wb-title">\u5FAE\u5E97\u7ED3\u7B97\u52A9\u624B</strong><small class="wb-version">v${F}</small></span>
        <button class="wb-icon-btn" type="button" data-action="collapse" title="\u6536\u8D77\u9762\u677F" aria-label="\u6536\u8D77\u9762\u677F">\u2212</button>
      </header>
      <div class="wb-body">
        <section class="wb-status" aria-live="polite">
          <span class="wb-status-dot" aria-hidden="true"></span>
          <span class="wb-status-copy"><strong class="wb-status-title">\u5C1A\u672A\u542F\u52A8</strong><small class="wb-status-detail">\u7B49\u5F85\u68C0\u6D4B\u7ED3\u7B97\u6309\u94AE</small></span>
          <output class="wb-countdown">--:--:--.-</output>
        </section>
        <div class="wb-form">
          <div>
            <div class="wb-label-row"><label class="wb-label" for="wb-target-at">\u76EE\u6807\u65F6\u95F4</label><button class="wb-link-btn" type="button" data-action="now">\u8BBE\u4E3A\u73B0\u5728</button></div>
            <input class="wb-date" id="wb-target-at" type="datetime-local" step="1" value="${r.targetAt}">
          </div>
          <div>
            <div class="wb-label-row"><span class="wb-label">\u68C0\u67E5\u9891\u7387</span></div>
            <div class="wb-segments" role="radiogroup" aria-label="\u68C0\u67E5\u9891\u7387">${t}</div>
          </div>
          <div class="wb-actions">
            <button class="wb-button" type="button" data-action="probe">\u68C0\u6D4B\u6309\u94AE</button>
            <button class="wb-button wb-button-primary" type="button" data-action="start">\u5F00\u59CB\u7B49\u5F85</button>
            <button class="wb-button" type="button" data-action="stop" disabled>\u505C\u6B62</button>
          </div>
        </div>
        <div class="wb-meta">
          <div class="wb-meta-item"><span class="wb-meta-label">\u5DF2\u9009\u5546\u54C1</span><strong class="wb-meta-value" data-field="count">--</strong></div>
          <div class="wb-meta-item"><span class="wb-meta-label">\u9875\u9762\u5B9A\u4F4D</span><strong class="wb-meta-value" data-field="selector">\u7B49\u5F85\u68C0\u6D4B</strong></div>
        </div>
        <ol class="wb-log" aria-label="\u8FD0\u884C\u8BB0\u5F55"></ol>
      </div>
    </section>`}function a(r,t){let e=r.querySelector(t);if(!e)throw new Error(`\u63A7\u5236\u9762\u677F\u5143\u7D20\u7F3A\u5931\uFF1A${t}`);return e}var v=class{constructor(t){this.document=t.document,this.handlers=t.handlers,this.clock=t.clock,this.armed=!1,this.lastInspectionKey="",this.createHost(t.settings),this.cacheElements(t.settings),this.bindActions(),this.addLog("\u52A9\u624B\u5DF2\u52A0\u8F7D")}createHost(t){this.host=this.document.createElement("aside"),this.host.id="wb-checkout-assistant",this.host.setAttribute("aria-label","\u5FAE\u5E97\u7ED3\u7B97\u52A9\u624B"),this.root=this.host.attachShadow({mode:"open"}),this.root.innerHTML=`<style>${O}</style>${G(t)}`,this.document.body.append(this.host)}cacheElements(t){this.shell=a(this.root,".wb-shell"),this.targetInput=a(this.root,"#wb-target-at"),this.startButton=a(this.root,'[data-action="start"]'),this.stopButton=a(this.root,'[data-action="stop"]'),this.log=a(this.root,".wb-log"),a(this.root,`input[name="interval"][value="${t.pollInterval}"]`).checked=!0}addLog(t){let e=this.document.createElement("li"),o=this.document.createElement("time"),s=this.document.createElement("span");for(o.textContent=M(this.clock()),s.textContent=t,e.append(o,s),this.log.prepend(e);this.log.children.length>B;)this.log.lastElementChild.remove()}setStatus(t){let{phase:e,title:o,detail:s,countdown:i="--:--:--.-"}=t;this.shell.dataset.phase=e,a(this.root,".wb-status-title").textContent=o,a(this.root,".wb-status-detail").textContent=s,a(this.root,".wb-countdown").textContent=i}setArmed(t){this.armed=t,this.targetInput.disabled=t,this.root.querySelectorAll('input[name="interval"]').forEach(e=>{e.disabled=t}),this.startButton.disabled=t,this.stopButton.disabled=!t}readSettings(){let t=a(this.root,'input[name="interval"]:checked');return Object.freeze({targetAt:this.targetInput.value,pollInterval:Number(t.value)})}renderInspection(t){a(this.root,'[data-field="count"]').textContent=t.count??"--";let e=a(this.root,'[data-field="selector"]');e.textContent=t.selector||"\u672A\u5B9A\u4F4D",e.title=t.selector||t.reason;let o=`${t.kind}:${t.count}:${t.reason}`;o!==this.lastInspectionKey&&(this.addLog(t.reason),this.lastInspectionKey=o),this.armed||this.renderInspectionStatus(t)}renderInspectionStatus(t){let e={ready:["ready","\u7ED3\u7B97\u6309\u94AE\u53EF\u7528"],empty:["idle","\u7B49\u5F85\u52FE\u9009\u5546\u54C1"],disabled:["idle","\u7ED3\u7B97\u6309\u94AE\u4E0D\u53EF\u7528"],missing:["error","\u672A\u5B9A\u4F4D\u7ED3\u7B97\u6309\u94AE"],invalid:["error","\u65E0\u6CD5\u786E\u8BA4\u6309\u94AE\u72B6\u6001"]},[o,s]=e[t.kind];this.setStatus({phase:o,title:s,detail:t.reason})}renderArmed(){this.setArmed(!0),this.setStatus({phase:"armed",title:"\u7B49\u5F85\u76EE\u6807\u65F6\u95F4",detail:"\u6301\u7EED\u68C0\u67E5\u9875\u9762\u72B6\u6001"}),this.addLog("\u5B9A\u65F6\u4EFB\u52A1\u5DF2\u542F\u52A8")}renderWaiting(t){let e=t.waitingForButton?"\u5DF2\u5230\u65F6\u95F4\uFF0C\u7B49\u5F85\u53EF\u7ED3\u7B97":"\u7B49\u5F85\u76EE\u6807\u65F6\u95F4",o=t.inspection.kind==="ready"?"ready":"armed";this.setStatus({phase:o,title:e,detail:t.inspection.reason,countdown:t.countdown})}renderTriggered(t){this.setArmed(!1),this.setStatus({phase:"triggered",title:"\u5DF2\u89E6\u53D1\u7ED3\u7B97",detail:t.label,countdown:"00:00:00.0"}),this.addLog(`\u5DF2\u70B9\u51FB\uFF1A${t.label}`)}renderStopped(){this.setArmed(!1),this.setStatus({phase:"idle",title:"\u4EFB\u52A1\u5DF2\u505C\u6B62",detail:"\u672A\u6267\u884C\u7ED3\u7B97"}),this.addLog("\u4EFB\u52A1\u5DF2\u624B\u52A8\u505C\u6B62")}renderError(t){this.setArmed(!1),this.setStatus({phase:"error",title:"\u8FD0\u884C\u9519\u8BEF",detail:t.message}),this.addLog(`\u9519\u8BEF\uFF1A${t.message}`)}toggleCollapsed(t){let e=this.shell.classList.toggle("is-collapsed");t.textContent=e?"+":"\u2212",t.title=e?"\u5C55\u5F00\u9762\u677F":"\u6536\u8D77\u9762\u677F"}bindActions(){a(this.root,'[data-action="collapse"]').addEventListener("click",t=>this.toggleCollapsed(t.currentTarget)),a(this.root,'[data-action="now"]').addEventListener("click",()=>{this.targetInput.value=w(this.clock())}),a(this.root,'[data-action="probe"]').addEventListener("click",this.handlers.probe),this.startButton.addEventListener("click",()=>this.handlers.start(this.readSettings())),this.stopButton.addEventListener("click",this.handlers.stop)}};function C(r){return new v(r)}var N="weidian-checkout-assistant:settings:v2",Y="wb-checkout-assistant";function K(r){let{getValue:t,setValue:e,clock:o}=r;return Object.freeze({load(){let s=t(N,null);return s===null?E(o()):c(s)},save(s){let i=c(s);return e(N,i),i}})}function q(r){let{document:t,clock:e,schedule:o,cancel:s,getValue:i,setValue:g,reportError:p}=r;if(t.getElementById(Y))return null;let h=K({getValue:i,setValue:g,clock:e}),f=h.load(),n,m=C({document:t,settings:f,clock:e,handlers:{probe:()=>n.probe(),start:d=>{try{n.start(h.save(d))}catch(b){m.renderError(b),p(b)}},stop:()=>n.stop()}});return n=A({clock:e,schedule:o,cancel:s,inspect:()=>T(t),trigger:z,view:m,reportError:p}),n.probe(),window.addEventListener("beforeunload",n.destroy,{once:!0}),n}function $(r,t){if(typeof t!="function")throw new Error(`Tampermonkey API \u4E0D\u53EF\u7528\uFF1A${r}`);return t}q({document,clock:()=>Date.now(),schedule:(r,t)=>window.setTimeout(r,t),cancel:r=>window.clearTimeout(r),getValue:$("GM_getValue",GM_getValue),setValue:$("GM_setValue",GM_setValue),reportError:r=>console.error("[\u5FAE\u5E97\u7ED3\u7B97\u52A9\u624B]",r)});})();
