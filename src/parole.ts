/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { Future } from './future'
import {
  isIterable,
  isThenable,
} from './type-cast'

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
export class Parole extends Future {
  catch (onReject: any = null): Future {
    return this.then(null, onReject)
  }

  finally (onFinally: any): Future {
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

  static resolve (x?: any): Future {
    return new Future((resolve: Function) => resolve(x))
  }

  static reject (reason?: any): Future {
    return new Future((resolve: Function, reject: Function) => reject(reason))
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
