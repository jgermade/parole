/* eslint-disable @typescript-eslint/strict-boolean-expressions */

export function isObject (o: any): boolean {
  return typeof o === 'object'
}

export function isFunction (o: any): boolean {
  return typeof o === 'function'
}

export function isIterable (o: any): boolean {
  return o && isFunction(o[Symbol.iterator])
}

export function isThenable (o: any): boolean {
  return o && (isObject(o) || isFunction(o)) && isFunction(o.then)
}
