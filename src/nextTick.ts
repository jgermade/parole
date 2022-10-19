/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* global globalThis, window */

export function isGlobal (o: any): boolean {
  return o && o.Math === Math && o.Array === Array
}

function getGlobalThis (): any {
  return typeof globalThis === 'object' && isGlobal(globalThis) ? globalThis : null
}

function getGlobalWindow (): any {
  return typeof window === 'object' && isGlobal(window) ? window : null
}

const _global = getGlobalThis() ?? getGlobalWindow()

export const processNextTick = (): Function => _global?.process?.nextTick

export const requestAnimationFrameNextTick = ((window: object, prefixes, i) => {
  let fnc
  while (!fnc && i < prefixes.length) {
    fnc = _global[prefixes[i++] + 'equestAnimationFrame']
  }
  return fnc?.bind(window)
})(_global, 'r webkitR mozR msR oR'.split(' '), 0)

// export const mutationObserverNextTick = (() => {
//     if ('MutationObserver' in window === false) return null
//     if (_global?.document?.createTextNode !== 'function') return null

//     const node = document.createTextNode('')

//     return (callback: Function) => {
//         var observer = new MutationObserver(() => {
//           callback()
//           observer.disconnect()
//         })
//         observer.observe(node, { characterData: true })
//         node.data = false
//     }
// })()

export const nextTick = processNextTick() ||
    _global.queueMicrotask ||
    requestAnimationFrameNextTick() ||
    _global.setImmediate ||
    ((callback: Function) => _global.setTimeout(callback, 0))
