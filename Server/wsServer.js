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
        const { type, id, username, phone_number, queue_length } = queryParams; 

        // ^^^ UPDATE: LOGIN PAGES ALREADY CHECK IF USER EXISTS, AND INSERTS NEW USER IF THEY DON'T
        // UPDATED REQUIREMENTS: 
        // + user added to websocket connection
        // - user added to database -> addDriver(id, username, phone_number, queue_length, uuid, drivers);

        //TEST CODE

        drivers[uuid] = {
            type: 'driver',
            id: id,
            username: username,  // Use the updated username
            phone_number: phone_number,
            queue_length: queue_length // Leave the queue length unchanged
        };
        console.log(drivers[uuid]);

        // END TEST CODE

        setTimeout(() => {
            broadcastDrivers();
            broadcastRiders();

        }, 100); // Allow time for `addDriver` to complete

    } else if (queryParams.type == "rider") {
        console.log("A rider has connected");
        const { type, id, username, phone_number, pickup_location, dropoff_location, driver_id } = queryParams;

        // Add new user to database if not exists,
        // AND add user to websocket connection
        
        // ^^^ UPDATE: LOGIN PAGES ALREADY CHECK IF USER EXISTS, AND INSERTS NEW USER IF THEY DON'T
        // UPDATED REQUIREMENTS: 
        // - user added to database -> addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId, uuid, riders);
        // + user added to websocket connection

        //TEST CODE

        riders[uuid] = {
            type: 'rider',
            id: id,
            username: username,  // Use the updated username
            phone_number: phone_number,
            pickup_location: pickup_location,
            dropoff_location: dropoff_location,
            driver_id: driver_id
        };
        console.log(riders[uuid]);

        // END TEST CODE

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

            addQueue(Number(riderId), Number(driverId), (err, queueId) => {
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

            // for (let connUuid in connections) {
            //     const conn = connections[connUuid];
            //     // Check if the connection is a driver and if the username matches
            //     if (drivers[connUuid] && drivers[connUuid].id === driverId) {
            //         driverFound = drivers[connUuid]; // Found the matching driver
            //         console.log(`Matching driver connection found when joining queue (Driver ID: ${driverId})`);
            //         break;
            //     }
            // }

            // TEST CODE

            for (let driverUuid in drivers) {
                if (Number(drivers[driverUuid].id) === Number(driverId)) {
                    driverFound = drivers[driverUuid];
                    console.log(`Matching driver connection found when joining queue (Driver ID: ${driverId})`);
                    break;
                }
            }

            // END TEST CODE 

            // Loop through all rider connections to find matching username
            console.log('Searching websocket connections for valid rider')

            let riderFound = null;

            // for (let connUuid in connections){
            //     const conn = connections[connUuid];
            //     // check if connection is a rider and has matching username
            //     if (riders[connUuid] && riders[connUuid].id === riderId) {
            //         riderFound = riders[connUuid]; // Found the matching rider
            //         console.log(`Matching rider connection found when joining queue (Rider ID: ${riderId})`);
            //         break;
            //     }
            // }


            // TEST CODE
            // END TEST CODE 

            for (let riderUuid in riders) {
                if (Number(riders[riderUuid].id) === Number(riderId)) {
                    riderFound = riders[riderUuid];
                    console.log(`Matching rider connection found when joining queue (Rider ID: ${riderId})`);
                    break;
                }
            }

            // END TEST CODE 

            
            // Check if a driver was found and if the rider exists
            if (driverFound && riderFound) {
                // Update the driver's queue length NEED TO DECREMENT QUEUE OF EXISTING DRIVER IF RIDER IS ALREADY IN A QUEUE
                driverFound.queue_length = String(Number(driverFound.queue_length) + 1);
                // Assign the rider to the driver
                riderFound.driver_id = String(driverId);

                console.log(`Rider ID: ${riderId} joined the queue for driver ID:${driverId}`);
                setTimeout(() => {
                    broadcastDrivers();
                    broadcastRiders();
                }, 100);
            } 


            // ^^^ UPDATE: DO WE EVEN NEED TO CHECK FOR A VALID RIDER CONNECTION? WE ARE THE CONNECTION

            // TEST CODE -->

            // if (driverFound && riderFound) {
            //     // Update the driver's queue length NEED TO DECREMENT QUEUE OF EXISTING DRIVER IF RIDER IS ALREADY IN A QUEUE
            //     driverFound.queue_length += 1;
            //     // Assign the rider to the driver
            //     riderFound.driver_id = driverId;

            //     console.log(`Rider ID: ${riderId} joined the queue for driver ID:${driverId}`);
            //     setTimeout(() => {
            //         broadcastDrivers();
            //         broadcastRiders();
            //     }, 100);
            // }

            // END TEST CODE
            
            else {
                console.log("Invalid driver or rider ID.");
            }

            // Ensure drivers and riders are defined
            console.log('Drivers:', drivers);
            console.log('Riders:', riders);
        }


        // Websocket updated for endQueue
        if (data.action === "endQueue") {
            const { driverId, riderId } = data;
            console.log(`Rider ID: ${riderId} is attempting to leave the queue`);
            console.log('Received data:', data);
            
            getQueueByRiderId(Number(riderId), (err, queue) => {
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

            for (let driverUuid in drivers) {
                if (Number(drivers[driverUuid].id) === Number(driverId)) {
                    driverFound = drivers[driverUuid];
                    console.log("Driver found");
                    break;
                }
            }

            // Find the rider with matching username
            console.log('Searching websocket connections for valid rider')

            let riderFound = null;

            // for (let connUuid in connections) {
            //     const conn = connections[connUuid];
            //     if (riders[connUuid] && riders[connUuid].id === riderId) {
            //         riderFound = riders[connUuid];
            //         console.log("Driver found");
            //         break;
            //     }
            // }
    
            for (let riderUuid in riders) {
                if (Number(riders[riderUuid].id) === Number(riderId)) {
                    riderFound = riders[riderUuid];
                    console.log("Rider found");
                    break;
                }
            }


            if (driverFound && riderFound) {
                // Update the queue and remove the rider's driverId
                driverFound.queue_length = String(Number(driverFound.queue_length) - 1);
                riderFound.driver_id = null;  // Rider is no longer assigned to a driver
    
                console.log(`Rider ID: ${riderId} left the queue for driver ${driverId}`);
                setTimeout(() => {
                    broadcastDrivers();
                    broadcastRiders();
                }, 100);
            } 
            
            // if the driver is not connected at the moment, allow user to end the queue
            else if (riderFound && !driverFound){
                console.log(`Driver (ID: ${driverId}) not connected to websocket at the moment. Unassigning driver from rider.`);

                riderFound.driver_id = null;  // Rider is no longer assigned to a driver
    
                console.log(`Rider ID: ${riderId} left the queue for driver ${driverId}`);
                setTimeout(() => {
                    broadcastDrivers();
                    broadcastRiders();
                }, 100);

            } else {
                console.log("Invalid driver or rider username.");
            }

            // Ensure drivers and riders are defined
            console.log('Drivers:', drivers);
            console.log('Riders:', riders);
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