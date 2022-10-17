/* global globalThis, window, global */

export function isGlobal (o) {
    return o && o.Math === Math && o.Array === Array
}

function getGlobalThis () {
    return typeof globalThis === 'object' && isGlobal(globalThis) && globalThis
}

function getGlobalWindow () {
    return typeof window === 'object' && isGlobal(window) && window
}

function getGlobalObj () {
    return typeof global === 'object' && isGlobal(global) && global
}

const _global = getGlobalThis() || getGlobalWindow() || getGlobalObj()

export const processNextTick = () => _global?.process?.nextTick

export const requestAnimationFrameNextTick = ((window, prefixes, i, p, fnc) => {
    while (!fnc && i < prefixes.length) {
        fnc = window[prefixes[i++] + 'equestAnimationFrame'];
    }
    return fnc && fnc.bind(window)
})(_global, 'r webkitR mozR msR oR'.split(' '), 0)

export const mutationObserverNextTick = (() => {
    if ('MutationObserver' in window === false) return null
    if (_global?.document?.createTextNode !== 'function') return null

    const node = document.createTextNode('')

    return callback => {
        var observer = new MutationObserver(() => {
          callback()
          observer.disconnect()
        })
        observer.observe(node, { characterData: true })
        node.data = false
    }
})()

export const nextTick = processNextTick() ||
    _global.queueMicrotask ||
    requestAnimationFrameNextTick() ||
    mutationObserverNextTick() ||
    _global.setImmediate ||
    (callback => _global.setTimeout(callback, 0))
