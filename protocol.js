'use strict'
const crc32 = require('crc-32')
const ByteBuffer = require('bytebuffer')

/**
 * Message Format
 *
 * Int32 length
 * Uint32Array payload
 * Int32 crc
 *
 * returned object { len, buffer, crc }
 */
class MessageProtocol {
    constructor() {
        this.ttl = 60 * 1000 // TTL 60 sec
        this.storageLimit = 5 * 1024 * 1024 // 5 mb - total cache storage size
        this.storageUsage = 0
        this.cached = []
    }

    removeCacheWithDebounce(func, wait, immediate) {
        let timeout
        return function() {
            let context = this,
                args = arguments
            clearTimeout(timeout)
            if (immediate && !timeout) func.apply(context, args)
            timeout = setTimeout(function() {
                timeout = null
                if (!immediate) func.apply(context, args)
            }, wait)
        }
    }

    async memoize(uintArray, fn) {
        const crc = crc32.buf(uintArray)
        let result
        if (this.cached[crc]) {
            result = this.cached[crc]
        } else {
            result = fn.apply(this, uintArray)
            this.storageUsage += result.length
            console.log(this.storageLimit, '---', this.storageUsage)
            if (this.storageLimit >= this.storageUsage) {
                this.cached[crc] = result
                this.removeCacheWithDebounce(() => {
                    this.storageUsage -= this.cached[crc].length
                    console.log('New storage used size: ', this.storageUsage)

                    console.log('Deleted cache row: ', crc)
                    delete this.cached[crc]
                }, this.ttl)()
            } else {
                throw new Error('Storage size is limited')
            }
        }
        return Promise.resolve(result)
    }
    toBuffer(arr) {
        if (Array.isArray(arr)) {
            const uintArray = new Uint32Array(arr)
            const fn = function() {
                const data = uintArray.buffer
                const len = uintArray.length
                const crc = crc32.buf(uintArray)
                const crcInt32 = new ByteBuffer(4).writeInt32(crc).flip()
                const lengthInt32 = new ByteBuffer(4).writeInt32(len).flip()
                return ByteBuffer.concat([
                    lengthInt32,
                    data,
                    crcInt32,
                ]).toBuffer()
            }
            return this.memoize(uintArray, fn).then((result) => {
                return result
            })
        } else {
            return Promise.reject('must be of type: array')
        }
    }

    fromBuffer(buffer) {
        const bufLen = buffer.length
        let buf = ByteBuffer.wrap(buffer, 'binary')
        const len = buf.slice(0, 4).readInt32()
        const crc = buf.slice(bufLen - 4).readInt32()
        const payloadArrayBuffer = buf.slice(4, bufLen - 4).toArrayBuffer()
        const payload = new Uint32Array(payloadArrayBuffer)
        const calculatedCrc = crc32.buf(payload)
        if (crc !== calculatedCrc) {
            throw new Error(
                'CRC not match: received: ' +
                    crc +
                    '; calculated: ' +
                    calculatedCrc
            )
        }
        return {
            len,
            payload,
            crc,
        }
    }
}

module.exports = MessageProtocol
