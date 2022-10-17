// import { nextTick } from './nextTick'

const nextTick = process.nextTick

// const PENDING = 'PENDING'
// const FULFILLED = 'FULFILLED'
// const REJECTED = 'REJECTED'

enum PromiseStates {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
}

const {
  PENDING,
  FULFILLED,
  REJECTED,
} = PromiseStates

// interface ThenQueueEntry {
//   onFulfill: Function | null
//   onReject: Function | null
// }

interface DeferredObject {
  promise?: Parole
  resolve?: Function
  reject?: Function
}

// const noop = (result: any) => result

export function isThenable (o: any): boolean {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!o) return false
  if (typeof o !== 'object' && typeof o !== 'function') return false
  if (typeof o.then !== 'function') return false
  return true
}

function runThen (fn: Function, x: any, resolve: Function, reject: Function): void {
  try {
    resolve(fn(x))
  } catch (err) {
    reject(err)
  }
}

export class Parole {
  value: any = null
  state: PromiseStates = PENDING
  
  private isCompleted: boolean = false
  private readonly fulfillQueue: Function[] = []
  private readonly rejectQueue: Function[] = []

  private doComplete (value: any, state: PromiseStates): void {
    if (this.isCompleted) return
    this.isCompleted = true
    this.value = value
    this.state = state

    nextTick(() => {
      state === FULFILLED
        ? this.rejectQueue.splice(0, this.rejectQueue.length)
        : this.fulfillQueue.splice(0, this.fulfillQueue.length)

      ;(
        state === FULFILLED
          ? this.fulfillQueue.splice(0, this.fulfillQueue.length)
          : this.rejectQueue.splice(0, this.rejectQueue.length)
      ).forEach((run) => run(value))
    })
  }

  private resolve (x: any): void {
    try {
      if (x === this) throw new TypeError('resolve value is the promise itself')

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const xThen = x && (typeof x === 'object' || x instanceof Function) && x.then

      if (xThen instanceof Function) {
        xThen.call(
          x,
          (_x: any) => !this.isCompleted && this.resolve(_x),
          (_r: any) => this.doComplete(_r, REJECTED),
        )
      } else {
        this.doComplete(x, FULFILLED)
      }
    } catch (err) {
      this.doComplete(err, REJECTED)
    }
  }

  private reject (reason: any): void {
    this.doComplete(reason, REJECTED)
  }

  constructor (runFn: Function) {
    try {
      runFn(this.resolve.bind(this), this.reject.bind(this))
    } catch (err) {
      this.reject(err)
    }
  }

  then (onFulfill: any = null, onReject: any = null): Parole {
    return new Parole((resolve: Function, reject: Function) => {
      const thenFulfill = onFulfill instanceof Function
        ? (x: any) => runThen(onFulfill, x, resolve, reject)
        : (x: any) => resolve(x)

      const thenReject = onReject instanceof Function
        ? (x: any) => runThen(onReject, x, resolve, reject)
        : (x: any) => reject(x)

      if (this.state === FULFILLED) nextTick(() => thenFulfill(this.value))
      else if (this.state === REJECTED) nextTick(() => thenReject(this.value))
      else {
        this.fulfillQueue.push(thenFulfill)
        this.rejectQueue.push(thenReject)
      }
    })
  }

  catch (onReject: any = null): Parole {
    return this.then(null, onReject)
  }

  static resolve (x: any): Parole {
    return new Parole((resolve: Function) => resolve(x))
  }

  static reject (reason: any): Parole {
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
}
