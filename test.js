const Server = require('./server.js')
const Client = require('./client.js')
const PORT = 3000
const HOST = 'localhost'

const randomArray = (num) => {
    return Array.from({ length: num }, () => Math.floor(Math.random() * num))
}

const server = new Server(PORT, HOST)

server.init().then(() => {
    console.log('Server loaded')
    const client = new Client(PORT, HOST)

    client
        .sendMessage(randomArray())
        .then(() => {
            return client.sendMessage(randomArray(40))
        })
        .then(() => {
            return client.sendMessage(randomArray(60))
        })
        .then(() => {
            return client.sendMessage(randomArray(500))
        })
        .then(() => {
            return client.sendMessage(randomArray(3000))
        })
        .then(() => {
            return client.sendMessage('string')
        })
        .then(() => {
            console.log(`Test finished`)
        })
        .catch((err) => {
            console.error(err)
        })
})
