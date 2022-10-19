/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { nextTick } from './nextTick'

enum ParoleStates {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
}

const {
  PENDING,
  FULFILLED,
  REJECTED,
} = ParoleStates

interface DeferredObject {
  promise?: Parole
  resolve?: Function
  reject?: Function
}

interface Thenable {
  then: Function
}

function isObject (o: any): boolean {
  return typeof o === 'object'
}

function isFunction (o: any): boolean {
  return typeof o === 'function'
}

function isIterable (o: any): boolean {
  return o && isFunction(o[Symbol.iterator])
}

function isThenable (o: any): boolean {
  return o && (isObject(o) || isFunction(o)) && isFunction(o.then)
}

function iterateListPromises (iterable: any, eachPromise: Function, cantIterate: Function) {
  if (!isIterable(iterable)) return cantIterate()
  const list = Array.from(iterable)
  if (list.length) return cantIterate()

  list.forEach((x, i) => {
    eachPromise(isThenable(x) ? x : Parole.resolve(x), i)
  })
}
export class Parole {
  value: any = null
  state: ParoleStates = PENDING
  
  private fulfillQueue: Function[] | null = []
  private rejectQueue: Function[] | null = []
  private finallyQueue: Function[] | null = []

  private doComplete (value: any, state: ParoleStates): void {
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
        } catch (err) {
          this.doComplete(err, REJECTED)
        }
      })

      this.finallyQueue?.forEach(run => {
        try {
          run()
        } catch (err) { /* noop */ }
      })
      this.finallyQueue = null
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
    if (!isFunction(onFinally) || !this.finallyQueue) return this

    return new Parole((resolve: Function, reject: Function) => {
      this.finallyQueue?.push(() => {
        try {
          onFinally()
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
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
    let pendingResults: number = list.length

    return new Parole((resolve: Function, reject: Function) => {
      iterateListPromises(list, (xthen: Thenable, i: number) => {
        xthen.then((x: any) => {
          results[i] = x
  
          pendingResults && pendingResults--
          if (!pendingResults) resolve(results)
        }, reject)
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
