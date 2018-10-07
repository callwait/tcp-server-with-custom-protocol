'use strict'

const net = require('net')
const MessageProtocol = require('./protocol.js')
const mp = new MessageProtocol()

class Client {
    constructor(port, address) {
        this.socket = new net.Socket()
        this.address = address
        this.port = port
        this.init()
    }
    init() {
        const client = this
        client.socket.connect(
            client.port,
            client.address,
            () => {}
        )
        client.socket.on('data', (data) => {
            console.log(`Client received: ${data}`)
            if (data.toString().endsWith('exit')) {
                client.socket.destroy()
            }
        })
        client.socket.on('close', () => {
            console.log('Client closed')
        })
        client.socket.on('error', (err) => {
            console.error(err)
        })
    }
    sendMessage(data) {
        const client = this
        return new Promise((resolve, reject) => {
            mp.toBuffer(data)
                .then((message) => {
                    console.log(
                        'We send to server: ' +
                            data.toString().substr(0, 200) +
                            '...'
                    )
                    client.socket.write(message)
                })
                .catch((e) => {
                    console.log(e)
                })
            client.socket.on('data', (e) => {
                resolve(e)
            })
            client.socket.on('error', (err) => {
                reject(err)
            })
        })
    }
}
module.exports = Client
