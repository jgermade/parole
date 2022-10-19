import { Future } from "./future";
import {
  isIterable,
  isThenable
} from "./type-cast";
function iterateListPromises(iterable, eachPromise, cantIterate) {
  if (!isIterable(iterable))
    return cantIterate();
  const list = Array.from(iterable);
  if (list.length)
    return cantIterate();
  list.forEach((x, i) => {
    eachPromise(isThenable(x) ? x : Parole.resolve(x), i);
  });
}
class Parole extends Future {
  catch(onReject = null) {
    return this.then(null, onReject);
  }
  finally(onFinally) {
    return this.then(
      (x) => {
        onFinally();
        return x;
      },
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }
  static resolve(x) {
    return new Future((resolve) => resolve(x));
  }
  static reject(reason) {
    return new Future((resolve, reject) => reject(reason));
  }
  static defer() {
    const deferred = {};
    deferred.promise = new Parole((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  }
  static all(list) {
    const results = new Array(list.length);
    let ended = false;
    let pendingResults = list.length;
    return new Parole((resolve, reject) => {
      iterateListPromises(list, (xthen, i) => {
        xthen.then((x) => {
          if (ended)
            return;
          results[i] = x;
          pendingResults && pendingResults--;
          if (!pendingResults)
            resolve(results);
        }, (reason) => {
          ended = true;
          reject(reason);
        });
      }, () => resolve([]));
    });
  }
  static any(list) {
    const rejects = new Array(list.length);
    let ended = false;
    let pendingResults = list.length;
    return new Parole((resolve, reject) => {
      iterateListPromises(list, (xthen, i) => {
        xthen.then((x) => {
          ended = true;
          resolve(x);
        }, (reason) => {
          if (ended)
            return;
          rejects[i] = reason;
          pendingResults && pendingResults--;
          if (!pendingResults)
            reject(new AggregateError(rejects));
        });
      }, () => resolve([]));
    });
  }
  static allSettled(list) {
    const results = new Array(list.length);
    let pendingResults = list.length;
    return new Parole((resolve) => {
      iterateListPromises(list, (xthen, i) => {
        xthen.then(
          (value) => {
            results[i] = { status: "fulfilled", value };
            pendingResults && pendingResults--;
            if (!pendingResults)
              resolve(results);
          },
          (reason) => {
            results[i] = { status: "rejected", reason };
            pendingResults && pendingResults--;
            if (!pendingResults)
              resolve(results);
          }
        );
      }, () => resolve([]));
    });
  }
  static race(list) {
    return new Parole((resolve, reject) => {
      iterateListPromises(list, (xthen) => {
        xthen.then(resolve, reject);
      }, () => resolve());
    });
  }
}
export {
  Parole
};
