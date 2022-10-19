/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { nextTick } from './nextTick'

import {
  isFunction,
  isObject,
} from './type-cast'

interface Thenable {
  then: Function
  catch?: Function
  finally?: Function
}

interface Deferred {
  promise: Object
  resolve: Function
  reject: Function
}

enum DeferStates {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
}

const {
  PENDING,
  FULFILLED,
  REJECTED,
} = DeferStates

export function defer (): Deferred {
  let value: any
  let state: DeferStates = PENDING

  let fulfillQueue: Function[] | null = []
  let rejectQueue: Function[] | null = []

  const promise: Thenable = {
    then (onFulfill: any = null, onReject: any = null): any {
      const { resolve, reject, promise } = defer()

      const thenFulfill = isFunction(onFulfill)
        ? (x: any) => { try { resolve(onFulfill(x)) } catch (err) { reject(err) } }
        : (x: any) => resolve(x)
  
      const thenReject = isFunction(onReject)
        ? (x: any) => { try { resolve(onReject(x)) } catch (err) { reject(err) } }
        : (x: any) => reject(x)
  
      if (state === FULFILLED) nextTick(() => thenFulfill(value))
      else if (state === REJECTED) nextTick(() => thenReject(value))
      else {
        fulfillQueue?.push(thenFulfill)
        rejectQueue?.push(thenReject)
      }

      return promise
    },
  }

  function doComplete (x: any, newState: DeferStates): void {
    value = x
    state = newState

    nextTick(() => {
      const queue = newState === FULFILLED
        ? fulfillQueue
        : rejectQueue

      fulfillQueue = null
      rejectQueue = null
      
      queue?.forEach((run) => {
        try {
          run(value)
        } catch (err) { /* noope */ }
      })
    })
  }

  function doResolve (x: any): void {
    let executed = false
    try {
      if (x === promise) throw new TypeError('resolve value is the promise itself')

      const xThen = x && (isObject(x) || isFunction(x)) && x.then

      if (isFunction(xThen)) {
        xThen.call(
          x,
          (_x: any) => {
            if (executed) return
            executed = true
            doResolve(_x)
          },
          (_r: any) => {
            if (executed) return
            executed = true
            doComplete(_r, REJECTED)
          },
        )
      } else {
        if (executed) return
        doComplete(x, FULFILLED)
      }
    } catch (err) {
      if (executed) return
      doComplete(err, REJECTED)
    }
  }

  return {
    promise,
    resolve: doResolve,
    reject (reason: any) {
      doComplete(reason, REJECTED)
    },
  }
}
