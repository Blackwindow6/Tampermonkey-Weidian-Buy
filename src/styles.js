export const PANEL_STYLES = `
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
`;
