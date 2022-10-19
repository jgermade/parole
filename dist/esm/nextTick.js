var _a;
function isGlobal(o) {
  return o && o.Math === Math && o.Array === Array;
}
function getGlobalThis() {
  return typeof globalThis === "object" && isGlobal(globalThis) ? globalThis : null;
}
function getGlobalWindow() {
  return typeof window === "object" && isGlobal(window) ? window : null;
}
const _global = (_a = getGlobalThis()) != null ? _a : getGlobalWindow();
const processNextTick = () => {
  var _a2;
  return (_a2 = _global == null ? void 0 : _global.process) == null ? void 0 : _a2.nextTick;
};
const requestAnimationFrameNextTick = ((window2, prefixes, i) => {
  let fnc;
  while (!fnc && i < prefixes.length) {
    fnc = _global[prefixes[i++] + "equestAnimationFrame"];
  }
  return fnc == null ? void 0 : fnc.bind(window2);
})(_global, "r webkitR mozR msR oR".split(" "), 0);
const nextTick = processNextTick() || _global.queueMicrotask || requestAnimationFrameNextTick() || _global.setImmediate || ((callback) => _global.setTimeout(callback, 0));
export {
  isGlobal,
  nextTick,
  processNextTick,
  requestAnimationFrameNextTick
};
