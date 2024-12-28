const http = require('http')
const {WebSocketServer, WebSocket } = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()
const wsServer = new WebSocketServer( {server})
const port = 8080
const sqlite3 = require('sqlite3').verbose();
const { addDriver, addRider } = require('./database'); // Import the database functions


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

    // if(queryParams.type == "driver"){
    //     console.log("A driver has connected")
    //     const {type, username, phoneNumber, queue} = queryParams; 
    //     drivers[uuid] = {
    //         type,
    //         username, 
    //         phoneNumber,
    //         queue
    //     }
    //     console.log(drivers[uuid])

    //     addDriver(username, phoneNumber, queue);

    //     broadcastDrivers()
    //     broadcastRiders()

    if (queryParams.type == "driver") {
        console.log("A driver has connected");
        const { type, username, phoneNumber, queue } = queryParams; 
        addDriver(username, phoneNumber, queue);

        // Query the database for the driver using the phone number
        db.get("SELECT * FROM drivers WHERE phone_number = ?", [phoneNumber], (err, row) => {
            if (err) {
                console.error("Error fetching driver data:", err);
                return;
            }
            
            if (row) {
                // Driver exists in the database, use their data
                drivers[uuid] = {
                    type,
                    username: row.username, // Use the username from the database
                    phoneNumber: row.phone_number,
                    queue: row.queue_length // Use the queue length from the database
                };
                console.log(drivers[uuid]);
            } else {
                // Driver does not exist in the database, add them
                drivers[uuid] = {
                    type,
                    username,
                    phoneNumber,
                    queue
                };
                console.log(drivers[uuid]);
            }

            broadcastDrivers();
            broadcastRiders();
        });

    // }else if(queryParams.type == "rider"){
    //     console.log("A rider has connected")
    //     const {type, username, phoneNumber, pickupLocation, dropoffLocation, driverId} = queryParams; 
    //     riders[uuid] = {
    //         type,
    //         username, 
    //         phoneNumber,
    //         pickupLocation,
    //         dropoffLocation,
    //         driverId
    //     }
    //     console.log(riders[uuid])

    //     addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId);

    //     broadcastDrivers()
    //     broadcastRiders()
    // }


    } else if (queryParams.type == "rider") {
        console.log("A rider has connected");
        const { type, username, phoneNumber, pickupLocation, dropoffLocation, driverId } = queryParams;

        // Query the database for the rider using the phone number
        db.get("SELECT * FROM riders WHERE phone_number = ?", [phoneNumber], (err, row) => {
            if (err) {
                console.error("Error fetching rider data:", err);
                return;
            }

            if (row) {
                // Rider exists in the database, update their details
                console.log("Updating rider with phone number:", phoneNumber);
                db.run(
                    "UPDATE riders SET username = ?, pickup_location = ?, dropoff_location = ?, driver_id = ? WHERE phone_number = ?",
                    [username, pickupLocation, dropoffLocation, driverId, phoneNumber],
                    (updateErr) => {
                        if (updateErr) {
                            console.error("Error updating rider:", updateErr);
                        } else {
                            console.log("Rider updated successfully.");
                        }
                    }
                );

                riders[uuid] = {
                    type,
                    username,
                    phoneNumber,
                    pickupLocation,
                    dropoffLocation,
                    driverId
                };
                console.log(riders[uuid]);
            } else {
                // Rider does not exist in the database, add them
                addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId);
                riders[uuid] = {
                    type,
                    username,
                    phoneNumber,
                    pickupLocation,
                    dropoffLocation,
                    driverId
                };
                console.log(riders[uuid]);
            }

            broadcastDrivers();
            broadcastRiders();
        });
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

    // users joining queue
    connection.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === "joinQueue") {
            const { driverId, riderId } = data;
            console.log(`Rider ${riderId} is attepmting to join a queue`);
            console.log(data);
            

             // Log the data to debug
            console.log('Received data:', data);

            // Ensure drivers and riders are defined
            console.log('Drivers:', drivers);
            console.log('Riders:', riders);

            // Loop through all connections to find the driver with the matching username
            let driverFound = null;

            for (let connUuid in connections) {
                const conn = connections[connUuid];
                // Check if the connection is a driver and if the username matches
                if (drivers[connUuid] && drivers[connUuid].username === driverId) {
                    driverFound = drivers[connUuid]; // Found the matching driver
                    break;
                }
            }

            // Loop through all rider connections

            let riderFound = null;

            for (let connUuid in connections){
                const conn = connections[connUuid];
                // check if connection is a rider and has matching username
                if (riders[connUuid] && riders[connUuid].username === riderId) {
                    riderFound = riders[connUuid]; // Found the matching rider
                    break;
                }
            }
            console.log(riderFound);

            // Check if a driver was found and if the rider exists
            if (driverFound && riderFound) {
                // Update the driver's queue length
                driverFound.queue += 1;
                // Assign the rider to the driver
                riderFound.driverId = driverId;

                console.log(`Rider ${riderId} joined the queue for driver ${driverId}`);
                broadcastDrivers();
                broadcastRiders();
            } else {
                console.log("Invalid driver or rider username.");
            }

            // Ensure drivers and riders are defined
            console.log('Drivers:', drivers);
            console.log('Riders:', riders);
        }

        // SQL QUERY

        if (data.action === 'joinQueue') {
            const { riderId, driverId } = data;
      
            // Find driver by username
            db.get('SELECT * FROM drivers WHERE username = ?', [driverId], (err, driver) => {
              if (err) {
                console.error('Error fetching driver:', err);
                return;
              }
      
              if (driver) {
                // Find rider by username
                db.get('SELECT * FROM riders WHERE username = ?', [riderId], (err, rider) => {
                  if (err) {
                    console.error('Error fetching rider:', err);
                    return;
                  }
      
                  if (rider) {
                    // Update rider's driver_id and increment driver's queue length
                    db.run('UPDATE riders SET driver_id = ? WHERE username = ?', [driver.id, riderId], (err) => {
                      if (err) {
                        console.error('Error updating rider:', err);
                        return;
                      }
      
                      // Increment the driver's queue length
                      db.run('UPDATE drivers SET queue_length = queue_length + 1 WHERE username = ?', [driverId], (err) => {
                        if (err) {
                          console.error('Error updating driver queue length:', err);
                          return;
                        }
      
                        // Notify clients about the updated queue
                        // broadcastToClients({ action: 'updateQueue', driverId, queueLength: driver.queue_length + 1 });
                      });
                    });
                  }
                });
              } else {
                console.log('Driver not found.');
              }
            });
          }

        // users leaving a queue
        if (data.action === "leaveQueue") {
            const { driverId, riderId } = data;
            console.log(`Rider ${riderId} is attempting to leave the queue`);
    
            let driverFound = null;
    
            // Find the driver with matching username
            for (let connUuid in connections) {
                const conn = connections[connUuid];
                if (drivers[connUuid] && drivers[connUuid].username === driverId) {
                    driverFound = drivers[connUuid];
                    break;
                }
            }
    
            let riderFound = null;
            // Find the rider with matching username
            for (let connUuid in connections) {
                const conn = connections[connUuid];
                if (riders[connUuid] && riders[connUuid].username === riderId) {
                    riderFound = riders[connUuid];
                    break;
                }
            }
    
            if (driverFound && riderFound) {
                // Update the queue and remove the rider's driverId
                driverFound.queue -= 1;
                riderFound.driverId = null;  // Rider is no longer assigned to a driver
    
                console.log(`Rider ${riderId} left the queue for driver ${driverId}`);
                broadcastDrivers();
                broadcastRiders();
            } else {
                console.log("Invalid driver or rider username.");
            }
        }

        // SQL QUERY

        if (data.action === 'leaveQueue') {
            const { riderId, driverId } = data;
      
            // Find driver by username
            db.get('SELECT * FROM drivers WHERE username = ?', [driverId], (err, driver) => {
              if (err) {
                console.error('Error fetching driver:', err);
                return;
              }
      
              if (driver) {
                // Find rider by username
                db.get('SELECT * FROM riders WHERE username = ?', [riderId], (err, rider) => {
                  if (err) {
                    console.error('Error fetching rider:', err);
                    return;
                  }
      
                  if (rider && rider.driver_id === driver.id) {
                    // Remove rider from the queue (set driver_id to NULL)
                    db.run('UPDATE riders SET driver_id = NULL WHERE username = ?', [riderId], (err) => {
                      if (err) {
                        console.error('Error updating rider:', err);
                        return;
                      }
      
                      // Decrement driver's queue length
                      db.run('UPDATE drivers SET queue_length = queue_length - 1 WHERE username = ?', [driverId], (err) => {
                        if (err) {
                          console.error('Error updating driver queue length:', err);
                          return;
                        }
      
                        // Notify clients about the updated queue
                        // broadcastToClients({ action: 'updateQueue', driverId, queueLength: driver.queue_length - 1 });
                      });
                    });
                  }
                });
              }
            });
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