"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var parole_exports = {};
__export(parole_exports, {
  Parole: () => Parole
});
module.exports = __toCommonJS(parole_exports);
var import_nextTick = require("./nextTick");
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = -1;
var PromiseStates = /* @__PURE__ */ ((PromiseStates2) => {
  PromiseStates2[PromiseStates2["PENDING"] = 0] = "PENDING";
  PromiseStates2[PromiseStates2["FULFILLED"] = 1] = "FULFILLED";
  PromiseStates2[PromiseStates2["REJECTED"] = 2] = "REJECTED";
  return PromiseStates2;
})(PromiseStates || {});
function isThenable(o) {
  if (!o)
    return false;
  if (typeof o !== "object" && typeof o !== "function")
    return false;
  if (typeof o.then !== "function")
    return false;
  return true;
}
function runThenQueue(value, state, queue) {
  if (state === FULFILLED) {
    queue.forEach(([onFulfill = null]) => onFulfill == null ? void 0 : onFulfill(value));
  } else {
    queue.forEach(([, onReject]) => onReject == null ? void 0 : onReject(value));
  }
}
class Parole {
  constructor(runClosure) {
    this.value = null;
    this.state = PENDING;
    this.resolveCalled = false;
    this.thenQueue = [];
    runClosure(this.resolve.bind(this), this.reject.bind(this));
  }
  resolve(x) {
    if (this.resolveCalled)
      return;
    if (x === this)
      throw new TypeError("resolve value is the promise itself");
    let hasThen;
    try {
      hasThen = isThenable(x);
    } catch (err) {
      this.reject(err);
      return;
    }
    if (hasThen) {
      try {
        x.then(
          this.resolve.bind(this),
          this.reject.bind(this)
        );
      } catch (err) {
        if (this.state === PENDING) {
          this.reject(err);
        }
      }
    } else {
      this.resolveCalled = true;
      this.value = x;
      this.state = FULFILLED;
      (0, import_nextTick.nextTick)(() => runThenQueue(this.value, this.state, this.thenQueue));
    }
  }
  reject(reason) {
    if (this.resolveCalled)
      return;
    this.resolveCalled = true;
    this.value = reason;
    this.state = REJECTED;
    (0, import_nextTick.nextTick)(() => runThenQueue(this.value, this.state, this.thenQueue));
  }
  then(onFulfill = null, onReject = null) {
    this.thenQueue.push([
      typeof onFulfill === "function" ? onFulfill : null,
      typeof onReject === "function" ? onReject : null
    ]);
    return this;
  }
  catch(onReject = null) {
    this.thenQueue.push([
      null,
      typeof onReject === "function" ? onReject : null
    ]);
    return this;
  }
  static resolve(x) {
    return new Parole((resolve) => resolve(x));
  }
  static reject(reason) {
    return new Parole((resolve, reject) => reject(reason));
  }
  static defer() {
    const deferred = {};
    deferred.promise = new Parole((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  }
}
