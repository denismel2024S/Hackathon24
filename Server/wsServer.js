const http = require('http')
const {WebSocketServer} = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()
const wsServer = new WebSocketServer( {server})
const port = 8080


const connections = {}
const users = {}
//send a message from the server to every user 
const broadcast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}


wsServer.on("connection", (connection, request) => {
    const {username} = url.parse(request.url, true). query
    const {passengers} = url.parse(request.url, true). query
    const {phoneNumber} = url.parse(request.url, true). query

    const uuid = uuidv4()

    console.log(username)
    console.log(passengers)
    console.log(phoneNumber)

    console.log(uuid)

    connections[uuid] = connection

    users[uuid] = {
        username, 
        passengers,
        phoneNumber
    }

    connection.on("message", message => handleMessage(message, uuid))
    connection.on("close", () => handleClose(uuid))
})


server.listen(port, () => {
    console.log(`Websocket server is running on port ${port}`)
})