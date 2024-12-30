const http = require('http')
const {WebSocketServer, WebSocket } = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()
const wsServer = new WebSocketServer( {server})
const port = 8080
const sqlite3 = require('sqlite3').verbose();
const { addDriver, addRider, getRiderByPhoneNumber, addQueue, updateQueueEndTime, getQueueByRiderId } = require('./database'); // Import the database functions


// Open SQLite database
const db = new sqlite3.Database('./app.db');

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

    if (queryParams.type == "driver") {
        console.log("A driver has connected");
        const { type, username, phoneNumber, queue } = queryParams; 
        addDriver(username, phoneNumber, queue, uuid, drivers);

        setTimeout(() => {
            broadcastDrivers();
            broadcastRiders();

        }, 100); // Allow time for `addDriver` to complete

    } else if (queryParams.type == "rider") {
        console.log("A rider has connected");
        const { type, username, phoneNumber, pickupLocation, dropoffLocation, driverId } = queryParams;

        addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId, uuid, riders);
        
        setTimeout(() => {
            broadcastDrivers();
            broadcastRiders();

        }, 100); // Allow time for `addDriver` to complete

    }

    // when anyone sends a json message to server
    connection.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === "joinQueue") {
            const { driverId, riderId } = data;
            console.log(`Rider ID: ${riderId} is attepmting to join a queue`);
            console.log('Received data:', data);
            
            // Ensure drivers and riders are defined
            console.log('Drivers:', drivers);
            console.log('Riders:', riders);

            addQueue(riderId, driverId, (err, queueId) => {
                if (err) {
                  console.error("Failed to add to queue:", err);
                } else {
                  console.log("Queue entry created with ID:", queueId);
                }
            });

            setTimeout(() => {
                broadcastDrivers();
                broadcastRiders();
            }, 100);

        
            // Loop through all connections to find the driver with the matching username
            console.log('Searching websocket connections for valid driver')

            let driverFound = null;

            for (let connUuid in connections) {
                const conn = connections[connUuid];
                // Check if the connection is a driver and if the username matches
                if (drivers[connUuid] && drivers[connUuid].id === driverId) {
                    driverFound = drivers[connUuid]; // Found the matching driver
                    break;
                }
            }

            // Loop through all rider connections to find matching username
            console.log('Searching websocket connections for valid rider')

            let riderFound = null;

            for (let connUuid in connections){
                const conn = connections[connUuid];
                // check if connection is a rider and has matching username
                if (riders[connUuid] && riders[connUuid].id === riderId) {
                    riderFound = riders[connUuid]; // Found the matching rider
                    break;
                }
            }

            // Check if a driver was found and if the rider exists
            if (driverFound && riderFound) {
                // Update the driver's queue length NEED TO DECREMENT QUEUE OF EXISTING DRIVER IF RIDER IS ALREADY IN A QUEUE
                driverFound.queue += 1;
                // Assign the rider to the driver
                riderFound.driverId = driverId;

                console.log(`Rider ID: ${riderId} joined the queue for driver ID:${driverId}`);
                setTimeout(() => {
                    broadcastDrivers();
                    broadcastRiders();
                }, 100);
            } else {
                console.log("Invalid driver or rider ID.");
            }
        }


        // Websocket updated for endQueue
        if (data.action === "endQueue") {
            const { driverId, riderId } = data;
            console.log(`Rider ID: ${riderId} is attempting to leave the queue`);
            console.log('Received data:', data);
            
            getQueueByRiderId(riderId, (err, queue) => {
                if (err) {
                    console.error('Error getting queue:', err);
                    return;
                }
                
                if (queue) {
                    // Step 2: Extract queueId from the result (queue object)
                    const queueId = queue.id; // queue.id is the unique ID of the queue entry
                    console.log('Queue found. Queue ID:', queueId);
                
                    // Step 3: Call updateQueueEndTime with the queueId to update the end time
                    updateQueueEndTime(queueId, (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating queue end time:', updateErr);
                    } else {
                        console.log('Queue end time updated successfully.');
                    }
                    });
                } else {
                    console.log('No queue found for this rider.');
                }
                });

                // Step 4: update websocket connections involved with joining and adding queues

                // Find the driver with matching username
                console.log('Searching websocket connections for valid driver')

                let driverFound = null;

                for (let connUuid in connections) {
                    const conn = connections[connUuid];
                    if (drivers[connUuid] && drivers[connUuid].id === driverId) {
                        driverFound = drivers[connUuid];
                        console.log("Rider found");
                        break;
                    }
                }

                // Find the rider with matching username
                console.log('Searching websocket connections for valid rider')

                let riderFound = null;

                for (let connUuid in connections) {
                    const conn = connections[connUuid];
                    if (riders[connUuid] && riders[connUuid].id === riderId) {
                        riderFound = riders[connUuid];
                        console.log("Driver found");
                        break;
                    }
                }
        
                if (driverFound && riderFound) {
                    // Update the queue and remove the rider's driverId
                    driverFound.queue -= 1;
                    riderFound.driverId = null;  // Rider is no longer assigned to a driver
        
                    console.log(`Rider ID: ${riderId} left the queue for driver ${driverId}`);
                    setTimeout(() => {
                        broadcastDrivers();
                        broadcastRiders();
                    }, 100);
                } else {
                    console.log("Invalid driver or rider username.");
                }
            }

    });

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

// Broadcast function to send data to all connected WebSocket clients
function broadcastToClients(message) {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

server.listen(port, () => {
    console.log(`Websocket server is running on port ${port}`)
})