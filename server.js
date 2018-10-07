'use strict'

const net = require('net')
const MessageProtocol = require('./protocol.js')
const mp = new MessageProtocol()

class Server {
    constructor(port, address) {
        this.port = port
        this.address = address
    }

    init() {
        let server = this
        let onClientConnected = (sock) => {
            let clientName = `${sock.remoteAddress}:${sock.remotePort}`

            sock.on('data', (data) => {
                const messageFromBuffer = mp.fromBuffer(data)
                sock.write(
                    'Ok, we have got: ' +
                        messageFromBuffer.payload.toString().substr(0, 200) +
                        '...\n'
                )
            })

            sock.on('close', () => {
                console.log(`connection from ${clientName} closed`)
            })

            sock.on('error', (err) => {
                console.log(`Connection ${clientName} error: ${err.message}`)
            })
        }

        server.connection = net.createServer(onClientConnected)
        return new Promise((resolve, reject) => {
            server.connection.listen(this.port, this.address, function(e) {
                resolve(e)
            })
        })
    }
}
module.exports = Server
