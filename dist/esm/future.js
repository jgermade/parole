import { nextTick } from "./nextTick";
import {
  isFunction,
  isObject
} from "./type-cast";
var FutureStates = /* @__PURE__ */ ((FutureStates2) => {
  FutureStates2["PENDING"] = "PENDING";
  FutureStates2["FULFILLED"] = "FULFILLED";
  FutureStates2["REJECTED"] = "REJECTED";
  return FutureStates2;
})(FutureStates || {});
const {
  PENDING,
  FULFILLED,
  REJECTED
} = FutureStates;
class Future {
  constructor(runFn) {
    this.value = null;
    this.state = PENDING;
    this.fulfillQueue = [];
    this.rejectQueue = [];
    try {
      runFn(this.doResolve.bind(this), this.doReject.bind(this));
    } catch (err) {
      this.doReject(err);
    }
  }
  doComplete(value, state) {
    this.value = value;
    this.state = state;
    nextTick(() => {
      const queue = state === FULFILLED ? this.fulfillQueue : this.rejectQueue;
      this.fulfillQueue = null;
      this.rejectQueue = null;
      queue == null ? void 0 : queue.forEach((run) => {
        try {
          run(value);
        } catch (err) {
          this.doComplete(err, REJECTED);
        }
      });
    });
  }
  doResolve(x) {
    let executed = false;
    try {
      if (x === this)
        throw new TypeError("resolve value is the promise itself");
      const xThen = x && (isObject(x) || isFunction(x)) && x.then;
      if (isFunction(xThen)) {
        xThen.call(
          x,
          (_x) => {
            if (executed)
              return;
            executed = true;
            this.doResolve(_x);
          },
          (_r) => {
            if (executed)
              return;
            executed = true;
            this.doComplete(_r, REJECTED);
          }
        );
      } else {
        if (executed)
          return;
        this.doComplete(x, FULFILLED);
      }
    } catch (err) {
      if (executed)
        return;
      this.doComplete(err, REJECTED);
    }
  }
  doReject(reason) {
    this.doComplete(reason, REJECTED);
  }
  then(onFulfill = null, onReject = null) {
    return new Future((resolve, reject) => {
      var _a, _b;
      const thenFulfill = isFunction(onFulfill) ? (x) => {
        try {
          resolve(onFulfill(x));
        } catch (err) {
          reject(err);
        }
      } : (x) => resolve(x);
      const thenReject = isFunction(onReject) ? (x) => {
        try {
          resolve(onReject(x));
        } catch (err) {
          reject(err);
        }
      } : (x) => reject(x);
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
}
export {
  Future
};
