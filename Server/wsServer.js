const http = require('http')
const {WebSocketServer} = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()
const wsServer = new WebSocketServer( {server})
const port = 8080


const connections = {}
const users = {}
const drivers = {}
const riders = {}
//send a message from the server to every user 
const broadcast = () => {
    console.log("Broadcasting...")
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

function broadcastRiders(){
    console.log("Broadcasting Riders...")
    const riderList = Object.values(riders)
    const riderListString = JSON.stringify(riderList)
    for(const uuid in drivers){
        const driverConnection = connections[uuid]
        driverConnection.send(riderListString)
    }
    const length = Object.keys(riders).length
    console.log("Amounnt of Riders: ", length)
}
function broadcastDrivers(){
    console.log("Broadcasting Drivers...")
    const driverList = Object.values(drivers)
    const driverListString = JSON.stringify(driverList)
    for(const uuid in riders){
        const riderConnection = connections[uuid]
        riderConnection.send(driverListString)
    }
    const length = Object.keys(drivers).length
    console.log("Amounnt of Drivers: ", length)
}
function broadcastUsers(){
    const userList = Object.values(users)
    const userListString = JSON.stringify(userList)
    for(const uuid in connections){
        connections[uuid].send(userListString)
    }
}

/*
What parameters does a Driver NEED
Name
Phone number
Current queue

What parameters does a Rider need
Name
Phone number
Pickup Location
Dropoff location
*/
wsServer.on("connection", (connection, request) => {
    console.log('Request URL:', request.url); 
    const queryParams = url.parse(request.url, true).query;
    //need to find a way to parse this data based on if the parameters are
    //given as a driver or as a rider
    console.log("Type: ", queryParams.type)
    const uuid = uuidv4()

    console.log("UUID: ", uuid)

    connections[uuid] = connection

    if(queryParams.type == "driver"){
        console.log("A driver has connected")
        const {type, username, phoneNumber, queue} = queryParams; 
        drivers[uuid] = {
            type,
            username, 
            phoneNumber,
            queue
        }
        console.log(drivers[uuid])
        broadcastRiders()
        

    }else if(queryParams.type == "rider"){
        console.log("A rider has connected")
        const {type, username, phoneNumber, pickupLocation, dropoffLocation} = queryParams; 
        riders[uuid] = {
            type,
            username, 
            phoneNumber,
            pickupLocation,
            dropoffLocation
        }
        console.log(riders[uuid])
        broadcastDrivers()
        broadcastRiders()
    }
    //const {type, username, passengers, phoneNumber, currentLocation} = queryParams; 

    //users[uuid] = {
        //type,
        //username, 
        //passengers,
        //phoneNumber,
        //currentLocation
    //}
    //console.log(users[uuid])
    
    /*
    pseudocode for switching types
    if(type == driver){
        broadcastAllRidersToDriver()
    }else if(type == rider){
        broadcastAllDriversToRider()
    }
    */
    //broadcastUsers()
    connection.on('close', () => {
        console.log(`User disconnected: ${queryParams.username}`)
        if(queryParams.type == "driver"){
            delete drivers[uuid]
            broadcastDrivers()
            broadcastRiders()

        }else if(queryParams.type == "rider"){
            delete riders[uuid]
            broadcastDrivers()
            broadcastRiders()
        }
        delete connections[uuid]
        //delete users[uuid]
        //broadcastUsers()
    })

    //connection.on("message", message => handleMessage(message, uuid))
    //connection.on("close", () => handleClose(uuid))
})


server.listen(port, () => {
    console.log(`Websocket server is running on port ${port}`)
})