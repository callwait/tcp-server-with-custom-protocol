const Server = require('./server.js')
const Client = require('./client.js')
const PORT = 3000
const HOST = 'localhost'

const randomArray = () => {
    return Array.from({length: 40}, () => Math.floor(Math.random() * 40))
}

const server = new Server(PORT, HOST)

server.init().then(() => {
    console.log('Server loaded')
    const client = new Client(PORT, HOST)

    client.sendMessage(randomArray())
        .then((data) => {
            return client.sendMessage(randomArray())
        })
        .then((data) => {
            return client.sendMessage(randomArray())
        })
        .then((data) => {
            return client.sendMessage(randomArray())
        })
        .then((data) => {
            console.log(`Test finished`)

        })
        .catch((err) => {
            console.error(err)
        })
})