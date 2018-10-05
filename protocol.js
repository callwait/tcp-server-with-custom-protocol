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
    toBuffer(arr) {
        const uintArray = new Uint32Array(arr)
        const data = uintArray.buffer
        const len = uintArray.length
        const crc = crc32.buf(uintArray)
        const crcInt32 = new ByteBuffer(4).writeInt32(crc).flip()
        const lengthInt32 = new ByteBuffer(4).writeInt32(len).flip()
        const buffer = ByteBuffer.concat([lengthInt32, data, crcInt32]).toBuffer()
        return {
            len,
            buffer,
            crc
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
            throw new Error('CRC not match: received: ' + crc + '; calculated: ' + calculatedCrc)
        }
        return {
            len,
            payload,
            crc
        }
    }

    memoize(fn) {
        let mem;
        return (...args) => {
          if (mem) {
            return mem;
          } else {
            mem = fn(...args);
            return mem;
          }
        }
      }

}

module.exports = MessageProtocol;
