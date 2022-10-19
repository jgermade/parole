import { nextTick } from "./nextTick";
import {
  isFunction,
  isObject
} from "./type-cast";
var DeferStates = /* @__PURE__ */ ((DeferStates2) => {
  DeferStates2["PENDING"] = "PENDING";
  DeferStates2["FULFILLED"] = "FULFILLED";
  DeferStates2["REJECTED"] = "REJECTED";
  return DeferStates2;
})(DeferStates || {});
const {
  PENDING,
  FULFILLED,
  REJECTED
} = DeferStates;
function defer() {
  let value;
  let state = PENDING;
  let fulfillQueue = [];
  let rejectQueue = [];
  const promise = {
    then(onFulfill = null, onReject = null) {
      const { resolve, reject, promise: promise2 } = defer();
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
      if (state === FULFILLED)
        nextTick(() => thenFulfill(value));
      else if (state === REJECTED)
        nextTick(() => thenReject(value));
      else {
        fulfillQueue == null ? void 0 : fulfillQueue.push(thenFulfill);
        rejectQueue == null ? void 0 : rejectQueue.push(thenReject);
      }
      return promise2;
    }
  };
  function doComplete(x, newState) {
    value = x;
    state = newState;
    nextTick(() => {
      const queue = newState === FULFILLED ? fulfillQueue : rejectQueue;
      fulfillQueue = null;
      rejectQueue = null;
      queue == null ? void 0 : queue.forEach((run) => {
        try {
          run(value);
        } catch (err) {
        }
      });
    });
  }
  function doResolve(x) {
    let executed = false;
    try {
      if (x === promise)
        throw new TypeError("resolve value is the promise itself");
      const xThen = x && (isObject(x) || isFunction(x)) && x.then;
      if (isFunction(xThen)) {
        xThen.call(
          x,
          (_x) => {
            if (executed)
              return;
            executed = true;
            doResolve(_x);
          },
          (_r) => {
            if (executed)
              return;
            executed = true;
            doComplete(_r, REJECTED);
          }
        );
      } else {
        if (executed)
          return;
        doComplete(x, FULFILLED);
      }
    } catch (err) {
      if (executed)
        return;
      doComplete(err, REJECTED);
    }
  }
  return {
    promise,
    resolve: doResolve,
    reject(reason) {
      doComplete(reason, REJECTED);
    }
  };
}
export {
  defer
};
