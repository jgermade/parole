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
const nextTick = process.nextTick;
var PromiseStates = /* @__PURE__ */ ((PromiseStates2) => {
  PromiseStates2["PENDING"] = "PENDING";
  PromiseStates2["FULFILLED"] = "FULFILLED";
  PromiseStates2["REJECTED"] = "REJECTED";
  return PromiseStates2;
})(PromiseStates || {});
const {
  PENDING,
  FULFILLED,
  REJECTED
} = PromiseStates;
function isObject(o) {
  return typeof o === "object";
}
function isFunction(o) {
  return typeof o === "function";
}
function runThen(fn, x, resolve, reject) {
  try {
    resolve(fn(x));
  } catch (err) {
    reject(err);
  }
}
class Parole {
  constructor(runFn) {
    this.value = null;
    this.state = PENDING;
    this.isCompleted = false;
    this.fulfillQueue = [];
    this.rejectQueue = [];
    try {
      runFn(this.doResolve.bind(this), this.doReject.bind(this));
    } catch (err) {
      this.doReject(err);
    }
  }
  doComplete(value, state) {
    if (this.isCompleted)
      return;
    this.isCompleted = true;
    this.value = value;
    this.state = state;
    nextTick(() => {
      var _a;
      ;
      (_a = state === FULFILLED ? this.fulfillQueue : this.rejectQueue) == null ? void 0 : _a.forEach((run) => run(value));
      this.fulfillQueue = null;
      this.rejectQueue = null;
    });
  }
  doResolve(x) {
    try {
      if (x === this)
        throw new TypeError("resolve value is the promise itself");
      const xThen = x && (isObject(x) || isFunction(x)) && x.then;
      if (isFunction(xThen)) {
        xThen.call(
          x,
          (_x) => !this.isCompleted && this.doResolve(_x),
          (_r) => this.doComplete(_r, REJECTED)
        );
      } else {
        this.doComplete(x, FULFILLED);
      }
    } catch (err) {
      this.doComplete(err, REJECTED);
    }
  }
  doReject(reason) {
    this.doComplete(reason, REJECTED);
  }
  then(onFulfill = null, onReject = null) {
    return new Parole((resolve, reject) => {
      var _a, _b;
      const thenFulfill = isFunction(onFulfill) ? (x) => runThen(onFulfill, x, resolve, reject) : (x) => resolve(x);
      const thenReject = isFunction(onReject) ? (x) => runThen(onReject, x, resolve, reject) : (x) => reject(x);
      if (this.state === FULFILLED)
        nextTick(() => thenFulfill(this.value));
      else if (this.state === REJECTED)
        nextTick(() => thenReject(this.value));
      else {
        (_a = this.fulfillQueue) == null ? void 0 : _a.push(thenFulfill);
        (_b = this.rejectQueue) == null ? void 0 : _b.push(thenReject);
      }
    });
  }
  catch(onReject = null) {
    return this.then(null, onReject);
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
