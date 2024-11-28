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
    console.log("Broadcasting...")
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

function broadcastUsers(){
    const userList = Object.values(users)
    const userListString = JSON.stringify(userList)
    for(const uuid in connections){
        connections[uuid].send(userListString)
    }
}


wsServer.on("connection", (connection, request) => {
    console.log('Request URL:', request.url); 
    const queryParams = url.parse(request.url, true).query;
    const {username, passengers, phoneNumber, currentLocation} = queryParams; 
    const uuid = uuidv4()


    console.log(uuid)

    connections[uuid] = connection

    users[uuid] = {
        username, 
        passengers,
        phoneNumber,
        currentLocation
    }
    console.log(users[uuid])
    
    console.log(username)
    console.log(passengers)
    console.log(phoneNumber)
    console.log(currentLocation)
    broadcastUsers()
    connection.on('close', () => {
        console.log(`User disconnected: ${username}`)
        delete connections[uuid]
        delete users[uuid]
        broadcastUsers()
    })

    //connection.on("message", message => handleMessage(message, uuid))
    //connection.on("close", () => handleClose(uuid))
})


server.listen(port, () => {
    console.log(`Websocket server is running on port ${port}`)
})