const http = require('http')
const {WebSocketServer, WebSocket } = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()
const wsServer = new WebSocketServer( {server})
const port = 8080
const sqlite3 = require('sqlite3').verbose();
const {addDriver, addRider, 
    getDriverById, addOrUpdateDriver,
     addOrUpdateRider, getRiderCoordinates, 
     updateRiderCoordinates, updateQueueStatus, 
     getRiderByPhoneNumber, addQueue, 
     getQueuesForDriver, endQueueAndResetDriver, 
     getQueueByRiderId, updateRiderLocationAddressById, 
     clearDatabase, clearQueues} = require('./database'); // Import the database functions


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
    
    const length = Object.keys(riders).length
    console.log("Amounnt of Riders: ", length)

    // if there's no information to be sent, return without sending data
    // avoids issues when sending null
    if (length === 0){
        return;
    }

    console.log("Broadcasting Riders...")
    const riderList = Object.values(riders)
    const riderListString = JSON.stringify(riderList)
    for(const uuid in drivers){
        const driverConnection = connections[uuid]
        driverConnection.send(riderListString)
    }
}

function broadcastDrivers(){
    const length = Object.keys(drivers).length
    console.log("Amounnt of Drivers: ", length)

    // if there's no information to be sent, return without sending data
    // avoids issues when sending null

    if (length === 0){
        return;
    }

    console.log("Broadcasting Drivers...")
    const driverList = Object.values(drivers)
    const driverListString = JSON.stringify(driverList)
    for(const uuid in riders){
        const riderConnection = connections[uuid]
        riderConnection.send(driverListString)
    }
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

        addOrUpdateDriver(username, phone_number, queue_length, uuid, drivers, (err, driver) => {
            if (err) {
              console.error("Error:", err);
            } else {
              console.log("Driver returned:", driver);

              drivers[uuid] = {
                type: 'driver',
                id: driver.id,
                username: driver.username,  // Use the updated username
                phone_number: driver.phone_number,
                queue_length: driver.queue_length // Leave the queue length unchanged
                };
                console.log(drivers[uuid]);
                const driverConnection = connections[uuid];

        
                setTimeout(() => {
                    driverConnection.send(JSON.stringify(driver))
                    broadcastDrivers();
                    broadcastRiders();
        
                }, 100); // Allow time for `addDriver` to complete
            }
        });

    } else if (queryParams.type == "rider") {
        console.log("A rider has connected");

        // Add new user to database if not exists,
        // AND add user to websocket connection
        
        // ^^^ UPDATE: LOGIN PAGES ALREADY CHECK IF USER EXISTS, AND INSERTS NEW USER IF THEY DON'T
        // UPDATED REQUIREMENTS: 
        // - user added to database -> addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId, uuid, riders);
        // + user added to websocket connection

        //TEST CODE

        const { type, username, phone_number, pickup_location, dropoff_location, driver_id } = queryParams;

        console.log(queryParams)
        
        addOrUpdateRider(
            username, 
            phone_number, 
            pickup_location, 
            dropoff_location, 
            driver_id, // Driver ID
            uuid, 
            riders, 
            (err, rider) => {
              if (err) {
                console.error("Error:", err);
              } else {
                console.log("Rider returned:", rider);

                // create new connection with new/updated user info
                riders[uuid] = {
                    type: 'rider',
                    id: rider.id,
                    username: rider.username,  
                    phone_number: rider.phone_number,
                    pickup_location: rider.pickup_location,
                    dropoff_location: rider.dropoff_location,
                    driver_id: rider.driver_id || null,
                };
                console.log(riders[uuid]);
                const riderConnection = connections[uuid];


                setTimeout(() => {
                    riderConnection.send(JSON.stringify(rider))
                    broadcastDrivers();
                    broadcastRiders();

                }, 100); // Allow time for `addDriver` to complete
              }
            }
          );

    }

    // when anyone sends a json message to server
    connection.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === 'riderLocationUpdate') {
            const { rider_id, pickup_coordinates, dropoff_coordinates } = data;
            console.log('Rider is attempting to update their coordinates:', data);
          
            // Step 2: Update rider coordinates in the database
            updateRiderCoordinates(
              rider_id,
              pickup_coordinates.lat,  // { lat } for pickup
              pickup_coordinates.lng,  // { lng } for pickup
              dropoff_coordinates.lat, // { lat } for dropoff
              dropoff_coordinates.lng, // { lng } for dropoff
              (err, updatedRider) => { // Callback to handle results
                if (err) {
                  console.error('Error updating rider coordinates:', err);
                } else {
                  console.log('Rider coordinates updated successfully:', updatedRider);
          
                  let riderConnection = null;
          
                  // Update the `riders` object and find the connection for this rider
                  for (let riderUuid in riders) {
                    if (Number(riders[riderUuid].id) === Number(rider_id)) {
                      riderConnection = connections[riderUuid];
                      riders[riderUuid] = { ...riders[riderUuid], ...updatedRider };
                      console.log("Rider found and updated.");
                      break;
                    }
                  }
          
                  // Send the updated rider information to the rider
                  if (riderConnection) {
                    setTimeout(() => {
                      riderConnection.send(JSON.stringify(updatedRider));
                    }, 100);
                  }
          
                  // If the rider has a driver assigned, update the driver's queue
                  if (updatedRider.driver_id !== null) {
                    getQueuesForDriver(updatedRider.driver_id, (err, rows) => {
                      if (err) {
                        console.error("Failed to fetch queue for driver:", err);
                      } else {
                        console.log("Queue details for driver:", rows);
          
                        // Map the queue data with position
                        const queues = rows.map((row, index) => ({
                          position: index + 1,
                          riderId: row.rider_id,
                          username: row.username,
                          phoneNumber: row.phone_number,
                          pickupLocation: row.pickup_location,
                          dropoffLocation: row.dropoff_location,
                          startTime: row.created_at,
                          queueId: row.queue_id,
                          status: row.status,
                        }));
          
                        // Find the driver connection
                        let driverFound = null;
                        let driverConnection = null;
          
                        for (let driverUuid in drivers) {
                          if (Number(drivers[driverUuid].id) === Number(updatedRider.driver_id)) {
                            driverFound = drivers[driverUuid];
                            driverConnection = connections[driverUuid];
                            console.log("Driver found and updated.");
                            break;
                          }
                        }
          
                        // Send the updated queue to the driver
                        if (driverFound) {
                          const driverMessage = {
                            type: "driver_queue",
                            data: queues,
                          };
          
                          setTimeout(() => {
                            driverConnection.send(JSON.stringify(driverMessage));
                          }, 100);
                        }
                      }
                    });
                  }
                }
              }
            );
          }
          
        if (data.action === 'riderLocationUpdate') {
            const { rider_id, pickup_address, dropoff_address } = data;
            console.log('Rider is attempting to update their location', data)

            // Step 2: Update rider in database
            updateRiderLocationAddressById(
                rider_id,                             // Rider ID
                pickup_address,                 // New pickup location
                dropoff_address,                  // New dropoff location
                (err, updatedRider) => {       // Callback to handle results
                  if (err) {
                    console.error('Error updating rider locations:', err);
                  } else {
                    console.log('Rider locations updated successfully:', updatedRider);

                    let riderConnection = null;
            
                    for (let riderUuid in riders) {
                        if (Number(riders[riderUuid].id) === Number(rider_id)) {
                            riderConnection = connections[riderUuid];
                            riders[riderUuid] = updatedRider;
                            console.log("Rider found");
                            break;
                        }
                    }

                    if (riderConnection) {
                        setTimeout(() => {
                        riderConnection.send(JSON.stringify(updatedRider))
                    }, 100);}

                    if (updatedRider.driver_id !== null){
                        getQueuesForDriver(updatedRider.driver_id, (err, rows) => {
                            if (err) {
                                console.error("Failed to fetch queue:", err);
                            } else {
                                console.log("Queue details for driver:", rows);
                    
                                // Map the queue data with position
                                const queues = rows.map((row, index) => ({
                                    position: index + 1,
                                    riderId: row.rider_id,
                                    username: row.username,
                                    phoneNumber: row.phone_number,
                                    pickupLocation: row.pickup_location,
                                    dropoffLocation: row.dropoff_location,
                                    startTime: row.created_at,
                                    queueId: row.queue_id,
                                    status: row.status
                                }));
                    
                                // Send full queue data to the driver
                                let driverFound = null;
                                let driverConnection = null;
                    
                                for (let driverUuid in drivers) {
                                    if (Number(drivers[driverUuid].id) === Number(updatedRider.driver_id)) {
                                        driverFound = drivers[driverUuid];
                                        driverConnection = connections[driverUuid];
                                        //driverFound.queue_length = rows.length;
                                        console.log("Driver found");
                                        break;
                                    }
                                }
                    
                                if (driverFound) {
                                    const driverMessage = {
                                        type: "driver_queue",
                                        data: queues,
                                    };
                    
                                    setTimeout(() => {
                                        driverConnection.send(JSON.stringify(driverMessage));
                                    }, 100);
                                }
                            }
                        });
                    }
                }
            });
        }

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
            let driverConnection = null;

            for (let driverUuid in drivers) {
                if (Number(drivers[driverUuid].id) === Number(driverId)) {
                    driverFound = drivers[driverUuid];
                    driverConnection = connections[driverUuid];
                    console.log(`Matching driver connection found when joining queue (Driver ID: ${driverId})`);
                    break;
                }
            }

            // Loop through all rider connections to find matching username
            console.log('Searching websocket connections for valid rider')

            let riderFound = null;
            let riderConnection = null;

            for (let riderUuid in riders) {
                if (Number(riders[riderUuid].id) === Number(riderId)) { 
                    riderFound = riders[riderUuid];
                    riderConnection = connections[riderUuid];
                    console.log(`Matching rider connection found when joining queue (Rider ID: ${riderId})`);
                    break;
                }
            }

            // Check if a driver was found and if the rider exists
            if (driverFound && riderFound) {

                // Update the driver's queue length NEED TO DECREMENT QUEUE OF EXISTING DRIVER IF RIDER IS ALREADY IN A QUEUE
                driverFound.queue_length = String(Number(driverFound.queue_length) + 1);
                // Assign the rider to the driver
                riderFound.driver_id = String(driverId);

                // TEST MESSASGE
                console.log("\n\nSTART TEST MESSAGE\n\n");
                
                const riderString = JSON.stringify(riderFound)
                console.log(riderString);
                const driverString = JSON.stringify(driverFound);
                console.log(driverString);

                console.log("\n\nEND TEST MESSAGE\n\n");
                // END TEST MESSASGE

                console.log(`Rider ID: ${riderId} joined the queue for driver ID:${driverId}`);
                setTimeout(() => {
                    riderConnection.send(riderString)
                    driverConnection.send(driverString)

                    broadcastDrivers();
                    broadcastRiders();
                }, 100);
            } 
            
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
                    endQueueAndResetDriver(Number(riderId), queueId, (updateErr) => {
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
            let driverConnection = null;

            for (let driverUuid in drivers) {
                if (Number(drivers[driverUuid].id) === Number(driverId)) {
                    driverFound = drivers[driverUuid];
                    driverConnection = connections[driverUuid];
                    console.log("Driver found");
                    break;
                }
            }

            // Find the rider with matching username
            console.log('Searching websocket connections for valid rider')

            let riderFound = null;
            let riderConnection = null;
    
            for (let riderUuid in riders) {
                if (Number(riders[riderUuid].id) === Number(riderId)) {
                    riderFound = riders[riderUuid];
                    riderConnection = connections[riderUuid];
                    console.log("Rider found");
                    break;
                }
            }


            if (driverFound && riderFound) {
                // Update the queue and remove the rider's driverId
                driverFound.queue_length = String(Number(driverFound.queue_length) - 1);
                riderFound.driver_id = null;  // Rider is no longer assigned to a driver

                // TEST MESSASGE
                console.log("\n\nSTART TEST MESSAGE\n\n");
                
                const riderString = JSON.stringify(riderFound)
                console.log(riderString);
                const driverString = JSON.stringify(driverFound);
                console.log(driverString);


                console.log("\n\nEND TEST MESSAGE\n\n");
                // END TEST MESSASGE
    
                console.log(`Rider ID: ${riderId} left the queue for driver ${driverId}`);
                setTimeout(() => {
                    broadcastDrivers();
                    broadcastRiders();
                    driverConnection.send(driverString);
                    riderConnection.send(riderString);
                }, 100);
            } 
            
            // if the driver is not connected at the moment, allow user to end the queue
            else if (riderFound && !driverFound){
                console.log(`Driver (ID: ${driverId}) not connected to websocket at the moment. Unassigning driver from rider.`);

                riderFound.driver_id = null;  // Rider is no longer assigned to a driver
                const riderString = JSON.stringify(riderFound)

                console.log(`Rider ID: ${riderId} left the queue for driver ${driverId}`);
                setTimeout(() => {
                    riderConnection.send(riderString)
                    broadcastDrivers();
                    broadcastRiders();
                }, 100);

            } // if the rider is not connected at the moment, allow driver to end the queue
            else if (!riderFound && driverFound){
                console.log(`Rider (ID: ${riderId}) not connected to websocket at the moment. Unassigning driver from rider.`);

                driverFound.queue_length = String(Number(driverFound.queue_length) - 1);
                const driverString = JSON.stringify(driverFound);
     
                console.log(`Rider ID: ${riderId} left the queue for driver ${driverId}`);
                setTimeout(() => {
                    driverConnection.send(driverString)
                    broadcastDrivers();
                    broadcastRiders();
                }, 100);

            }
            else {
                console.log("Invalid driver or rider username.");
            }

            // Ensure drivers and riders are defined
            console.log('Drivers:', drivers);
            console.log('Riders:', riders);
        }
        if (data.action === "getActiveQueues") {
            const { driverId } = data;
            console.log('Retrieving all active queues with driver_id: ', driverId);
        
            getQueuesForDriver(driverId, (err, rows) => {
                if (err) {
                    console.error("Failed to fetch queue:", err);
                } else {
                    console.log("Queue details for driver:", rows);
        
                    // Map the queue data with position
                    const queues = rows.map((row, index) => ({
                        position: index + 1,
                        riderId: row.rider_id,
                        username: row.username,
                        phoneNumber: row.phone_number,
                        pickupLocation: row.pickup_location,
                        dropoffLocation: row.dropoff_location,
                        startTime: row.created_at,
                        queueId: row.queue_id,
                        status: row.status
                    }));
        
                    // Send full queue data to the driver
                    let driverFound = null;
                    let driverConnection = null;
        
                    for (let driverUuid in drivers) {
                        if (Number(drivers[driverUuid].id) === Number(driverId)) {
                            driverFound = drivers[driverUuid];
                            driverConnection = connections[driverUuid];
                            //driverFound.queue_length = rows.length;
                            console.log("Driver found");
                            break;
                        }
                    }
        
                    if (driverFound) {
                        const driverMessage = {
                            type: "driver_queue",
                            data: queues,
                        };
        
                        setTimeout(() => {
                            driverConnection.send(JSON.stringify(driverMessage));
                        }, 100);
                    }
        
                    // Send specific queue details to connected riders
                    console.log('Notifying riders of their queue positions...');
        
                    rows.forEach((row, index) => {
                        const riderUuid = Object.keys(riders).find(
                            (uuid) => Number(riders[uuid].id) === row.rider_id
                        );
        
                        if (riderUuid && connections[riderUuid]) {
                            const riderConnection = connections[riderUuid];
                            const riderQueueMessage = {
                                type: "rider_queue",
                                data: {
                                    position: index + 1,
                                    queueId: row.queue_id,
                                    driverId: driverId,
                                    pickupLocation: row.pickup_location,
                                    dropoffLocation: row.dropoff_location,
                                    startTime: row.created_at,
                                    status: row.status
                                },
                            };

                            
                            setTimeout(() => {
                                riderConnection.send(JSON.stringify(riderQueueMessage));
                                console.log(
                                    `Rider ${row.rider_id} notified with queue position ${index + 1}.`
                                );


                                // request the current location of the first person in the queue
                                if (index === 0){
                                    const currentRiderLocationRequestMessage = {
                                        type: "riderLocationRequest",
                                        driver_id: driverId,
                                    };
                                    
                                    riderConnection.send(JSON.stringify(currentRiderLocationRequestMessage))
                                }
                            }, 100);
                        } else {
                            console.log(`Rider ${row.rider_id} not connected.`);
                        }
                    });
                }
            });
        }

        if (data.action === "sendRiderLocationToDriver"){
            console.log("Sending location do driver", data);

            const { driverId, pickup_location, pickup_coordinates, dropoff_location, riderId} = data;

            let driverFound = null;
            let driverConnection = null;

            for (let driverUuid in drivers) {
                if (Number(drivers[driverUuid].id) === Number(driverId)) {
                    driverFound = drivers[driverUuid];
                    driverConnection = connections[driverUuid];
                    //driverFound.queue_length = rows.length;
                    console.log("Driver found");
                    break;
                }
            }
            if (driverFound && driverConnection) {
                // Prepare the payload for the driver
                const driverPayload = {
                    type: "riderLocationUpdate",
                    rider_id: riderId,
                    driver_id: driverId,
                    pickup_location: pickup_location,
                    pickup_coordinates: pickup_coordinates,
                    dropoff_location: dropoff_location,
                };
        
                // Send the payload to the driver's connection
                try {
                    driverConnection.send(JSON.stringify(driverPayload));
                    console.log(`Location data sent to driver ${driverId}`);
                } catch (error) {
                    console.error(`Error sending data to driver ${driverId}:`, error);
                }
            } else {
                console.error(`Driver with ID ${driverId} not found or not connected`);
            }

            
        }
        if (data.action === "queueStatusUpdate") {
            const { driverId, riderId, status } = data;
          
            let riderFound = null;
            let riderConnection = null;
          
            for (let riderUuid in riders) {
              if (Number(riders[riderUuid].id) === Number(riderId)) {
                riderFound = riders[riderUuid];
                riderConnection = connections[riderUuid];
                console.log("Rider found");
                break;
              }
            }
          
            if (riderFound) {
              // Update the queue status and send the updated queue to the rider
              updateQueueStatus(riderId, driverId, status, (err, updatedQueue) => {
                if (err) {
                  console.error("Failed to update status:", err);
                } else {
                  console.log("Status updated successfully. Updated queue:", updatedQueue);
          
                  // Construct the WebSocket message for the rider
                  const message = {
                    type: "rider_queue",
                    data: updatedQueue,
                  };
          
                  if (riderConnection && riderConnection.readyState === WebSocket.OPEN) {
                    console.log(`Sending updated queue to Rider (ID: ${riderId}):`, message);
          
                    setTimeout(() => {
                      riderConnection.send(JSON.stringify(message));
                      broadcastDrivers();
                      broadcastRiders();
                    }, 100);
                  } else {
                    console.error("Rider connection is not open or valid.");
                  }
                }
              });
            }
        }
        if (data.action === "getDriverByPhoneNumber") {
            const { driverId, riderId } = data;
        
            console.log(`Fetching driver information for Driver ID: ${driverId}, Rider ID: ${riderId}`);
        
            // Validate the provided driverId
            if (!driverId) {
                console.error("Invalid driver ID received.");
                return;
            }
        
            // Use the database function to retrieve the driver's information
            getDriverById(driverId, (err, driver) => {

                let riderFound = null;
                let riderConnection = null;
            
                for (let riderUuid in riders) {
                    if (Number(riders[riderUuid].id) === Number(riderId)) {
                        riderFound = riders[riderUuid];
                        riderConnection = connections[riderUuid];
                        console.log("Rider found");
                        break;
                    }
                }

                if (err) {
                    console.error("Failed to retrieve driver information:", err);
        
                    // Optionally, send an error response back to the client
                    const errorMessage = {
                        type: "error",
                        message: "Failed to retrieve driver information.",
                    };
                    if (riderConnection?.readyState === WebSocket.OPEN) {
                        riderConnection.send(JSON.stringify(errorMessage));
                    }
                    return;
                }
        
                if (!driver) {
                    console.error("No driver found with the given ID.");
        
                    // Send a "not found" response
                    const notFoundMessage = {
                        type: "driver",
                        data: null, // No driver data available
                    };
                    if (riderConnection?.readyState === WebSocket.OPEN) {
                        riderConnection.send(JSON.stringify(notFoundMessage));
                    }
                    return;
                }
        
                console.log("Driver information retrieved successfully:", driver);
        
                // Send the driver's information back to the rider
                const driverMessage = {
                    type: "driver",
                    data: driver,
                };

                // Check if driverMessage.data is already an array and wrap it accordingly
                if (Array.isArray(driverMessage.data)) {
                    driverMessage.data = driverMessage.data[0]; // Take the first element if it is an array
                }

                try {
                    if (!riderConnection || !driverMessage){
                        console.log('riderConnection not established or message not initialized correctly')
                        return;
                    }
                    setTimeout(() => {
                        riderConnection.send(JSON.stringify(driverMessage));
                    }, 100);
                    console.log("Sent message:", driverMessage);
                } catch (err) {
                    console.error("Failed to send driver object", err);
                }
        
                
            });
        }
        if(data.action === "checkQueues"){
            console.log("CLIENT WANTS TO CHECK QUEUES")
            broadcastDrivers();
            broadcastRiders();
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
    })

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
    clearQueues();
    console.log(`Websocket server is running on port ${port}`)
})