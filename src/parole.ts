/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { nextTick } from './nextTick'
import {
  isFunction,
  isObject,
  isIterable,
  isThenable,
} from './type-cast'

enum FutureStates {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
}

const {
  PENDING,
  FULFILLED,
  REJECTED,
} = FutureStates

interface DeferredObject {
  promise?: Parole
  resolve?: Function
  reject?: Function
}

interface Thenable {
  then: Function
}

function iterateListPromises (iterable: any, eachPromise: Function, cantIterate: Function): void {
  if (!isIterable(iterable)) return cantIterate()
  const list = Array.from(iterable)
  if (list.length) return cantIterate()

  list.forEach((x, i) => {
    eachPromise(isThenable(x) ? x : Parole.resolve(x), i)
  })
}
export class Parole {
  value: any = null
  state: FutureStates = PENDING
  
  private fulfillQueue: Function[] | null = []
  private rejectQueue: Function[] | null = []

  private doComplete (value: any, state: FutureStates): void {
    this.value = value
    this.state = state

    nextTick(() => {
      const queue = state === FULFILLED
        ? this.fulfillQueue
        : this.rejectQueue

      this.fulfillQueue = null
      this.rejectQueue = null
      
      queue?.forEach((run) => {
        try {
          run(value)
        } catch (err) { /* noop */ }
      })
    })
  }

  private doResolve (x: any): void {
    let executed = false
    try {
      if (x === this) throw new TypeError('resolve value is the promise itself')

      const xThen = x && (isObject(x) || isFunction(x)) && x.then

      if (isFunction(xThen)) {
        xThen.call(
          x,
          (_x: any) => {
            if (executed) return
            executed = true
            this.doResolve(_x)
          },
          (_r: any) => {
            if (executed) return
            executed = true
            this.doComplete(_r, REJECTED)
          },
        )
      } else {
        if (executed) return
        this.doComplete(x, FULFILLED)
      }
    } catch (err) {
      if (executed) return
      this.doComplete(err, REJECTED)
    }
  }

  private doReject (reason: any): void {
    this.doComplete(reason, REJECTED)
  }

  constructor (runFn: Function) {
    try {
      runFn(this.doResolve.bind(this), this.doReject.bind(this))
    } catch (err) {
      this.doReject(err)
    }
  }

  then (onFulfill: any = null, onReject: any = null): Parole {
    return new Parole((resolve: Function, reject: Function) => {
      const thenFulfill = isFunction(onFulfill)
        ? (x: any) => { try { resolve(onFulfill(x)) } catch (err) { reject(err) } }
        : (x: any) => resolve(x)

      const thenReject = isFunction(onReject)
        ? (x: any) => { try { resolve(onReject(x)) } catch (err) { reject(err) } }
        : (x: any) => reject(x)

      if (this.state === FULFILLED) nextTick(() => thenFulfill(this.value))
      else if (this.state === REJECTED) nextTick(() => thenReject(this.value))
      else {
        this.fulfillQueue?.push(thenFulfill)
        this.rejectQueue?.push(thenReject)
      }
    })
  }

  catch (onReject: any = null): Parole {
    return this.then(null, onReject)
  }

  finally (onFinally: any): Parole {
    return this.then(
      (x: any) => {
        onFinally()
        return x
      },
      (reason: any) => {
        onFinally()
        throw reason
      },
    )
  }

  static resolve (x?: any): Parole {
    return new Parole((resolve: Function) => resolve(x))
  }

  static reject (reason?: any): Parole {
    return new Parole((resolve: Function, reject: Function) => reject(reason))
  }

  static defer (): DeferredObject {
    const deferred: DeferredObject = {}
    deferred.promise = new Parole((resolve: Function, reject: Function) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    return deferred
  }

  static all (list: Thenable[]): Parole {
    const results = new Array(list.length)
    let ended = false
    let pendingResults: number = list.length

    return new Parole((resolve: Function, reject: Function) => {
      iterateListPromises(list, (xthen: Thenable, i: number) => {
        xthen.then((x: any) => {
          if (ended) return
          results[i] = x
  
          pendingResults && pendingResults--
          if (!pendingResults) resolve(results)
        }, (reason: any) => {
          ended = true
          reject(reason)
        })
      }, () => resolve([]))
    })
  }

  static any (list: Thenable[]): Parole {
    const rejects = new Array(list.length)
    let ended = false
    let pendingResults: number = list.length

    return new Parole((resolve: Function, reject: Function) => {
      iterateListPromises(list, (xthen: Thenable, i: number) => {
        xthen.then((x: any) => {
          ended = true
          resolve(x)
        }, (reason: any) => {
          if (ended) return
          rejects[i] = reason
  
          pendingResults && pendingResults--
          // @ts-expect-error
          if (!pendingResults) reject(new AggregateError(rejects))
        })
      }, () => resolve([]))
    })
  }

  static allSettled (list: Thenable[]): Parole {
    const results = new Array(list.length)
    let pendingResults: number = list.length

    return new Parole((resolve: Function) => {
      iterateListPromises(list, (xthen: Thenable, i: number) => {
        xthen.then(
          (value: any) => {
            results[i] = { status: 'fulfilled', value }
            pendingResults && pendingResults--
            if (!pendingResults) resolve(results)
          },
          (reason: any) => {
            results[i] = { status: 'rejected', reason }
            pendingResults && pendingResults--
            if (!pendingResults) resolve(results)
          })
      }, () => resolve([]))
    })
  }

  static race (list: Thenable[]): Parole {
    return new Parole((resolve: Function, reject: Function) => {
      iterateListPromises(list, (xthen: Thenable) => {
        xthen.then(resolve, reject)
      }, () => resolve())
    })
  }
}

export default Parole
