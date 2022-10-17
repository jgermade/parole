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
      runFn(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }
  doComplete(value, state) {
    if (this.isCompleted)
      return;
    this.isCompleted = true;
    this.value = value;
    this.state = state;
    nextTick(() => {
      state === FULFILLED ? this.rejectQueue.splice(0, this.rejectQueue.length) : this.fulfillQueue.splice(0, this.fulfillQueue.length);
      (state === FULFILLED ? this.fulfillQueue.splice(0, this.fulfillQueue.length) : this.rejectQueue.splice(0, this.rejectQueue.length)).forEach((run) => run(value));
    });
  }
  resolve(x) {
    try {
      if (x === this)
        throw new TypeError("resolve value is the promise itself");
      const xThen = x && (isObject(x) || isFunction(x)) && x.then;
      if (isFunction(xThen)) {
        xThen.call(
          x,
          (_x) => !this.isCompleted && this.resolve(_x),
          (_r) => this.doComplete(_r, REJECTED)
        );
      } else {
        this.doComplete(x, FULFILLED);
      }
    } catch (err) {
      this.doComplete(err, REJECTED);
    }
  }
  reject(reason) {
    this.doComplete(reason, REJECTED);
  }
  then(onFulfill = null, onReject = null) {
    return new Parole((resolve, reject) => {
      const thenFulfill = isFunction(onFulfill) ? (x) => runThen(onFulfill, x, resolve, reject) : (x) => resolve(x);
      const thenReject = isFunction(onReject) ? (x) => runThen(onReject, x, resolve, reject) : (x) => reject(x);
      if (this.state === FULFILLED)
        nextTick(() => thenFulfill(this.value));
      else if (this.state === REJECTED)
        nextTick(() => thenReject(this.value));
      else {
        this.fulfillQueue.push(thenFulfill);
        this.rejectQueue.push(thenReject);
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
