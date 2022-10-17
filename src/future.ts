
import { nextTick } from './nextTick'

const PENDING = 0
const FULFILLED = 1
const REJECTED = -1

enum PromiseStates {
    PENDING,
    FULFILLED,
    REJECTED,
}

interface ThenQueueEntry {
    onFulfill: Function|null
    onReject: Function|null
}

// const noop = (result: any) => result

function isThenable (o: any) {
    if (!o) return false
    if (typeof o !== 'object' && typeof o !== 'function') return false
    if (typeof o.then !== 'function') return false
    return true
}

function runThenQueue (value: any, state: PromiseStates, queue: Array<ThenQueueEntry>) {
    if (state === FULFILLED) {
        queue.forEach(entry => entry.onFulfill && entry.onFulfill(value))
    } else {
        queue.forEach(entry => entry.onReject && entry.onReject(value))
    }
}

class Parole {
    value: any = null
    state: PromiseStates = PENDING
    resolveCalled: boolean = false
    thenQueue: Array<ThenQueueEntry> = []

    resolve (x: any) {
        if (this.resolveCalled) return
        
        if (x === this) throw new TypeError('resolve value is the promise itself')
        // if (x instanceof Parole) {
        //     this.resolveCalled = true
        //     this.value = x.value
        //     this.state = x.state
        // }

        let hasThen: boolean

        try {
            hasThen = isThenable(x)
        } catch (err) {
            this.reject(err)
            return
        }

        if (hasThen) {
            try {
                x.then.call(
                    x,
                    this.resolve.bind(this),
                    this.reject.bind(this),
                )
            } catch (err) {
                if (this.state === PENDING) {
                    this.reject(err)
                }
            }
        } else {
            this.resolveCalled = true
            this.value = x
            this.state = FULFILLED

            nextTick(() => runThenQueue(this.value, this.state, this.thenQueue))
        }
    }

    reject (reason: any) {
        if (this.resolveCalled) return
        this.resolveCalled = true

        this.value = reason
        this.state = REJECTED

        nextTick(() => runThenQueue(this.value, this.state, this.thenQueue))
    }

    constructor (runClosure: Function) {
        runClosure(this.resolve.bind(this), this.reject.bind(this))
    }

    then (onFulfill: Function|null = null, onReject: Function|null = null) {
        this.thenQueue.push({
            onFulfill: typeof onFulfill === 'function' ? onFulfill : null,
            onReject: typeof onReject === 'function' ? onReject : null,
        })
        return this
    }

    catch (onReject: Function|null = null) {
        this.thenQueue.push({
            onFulfill: null,
            onReject: typeof onReject === 'function' ? onReject : null,
        })
        return this
    }
}