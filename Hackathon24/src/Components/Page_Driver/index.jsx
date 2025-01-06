import React, { useState, useEffect, useRef } from "react";
import CurrentQueuePassengerInfoCard from "../current_queue_passenger_info_card";
import axios from "axios";
import QueueTable from "../queue_table";
import './index.css';


export function PageDriver({formData, driver, setDriver, socket}) {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const previousUsers = useRef([])
    const socketRef = useRef(null);
    
    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary

    useEffect(() => {

        // Fetch passenger data from an API or other source

        const queryParams = new URLSearchParams({
            type: "driver",
            id: driver.id,
            username: driver.username,
            phone_number: driver.phone_number,
            queue_length: driver.queue_length,
        }).toString();

        const WSURL = `ws://localhost:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)
        window.localStorage.setItem('driver', JSON.stringify(driver));
    
        socketRef.current.onopen = () => {
            console.log('Websocket connection established')

            const message = {
                driverId: Number(driver.id),  // driver's ID
                action: "getActiveQueues",
              };
        
              try {
                socketRef.current.send(JSON.stringify(message));
                console.log("Sent message:", message);
              } catch (err) {
                console.error("Failed to update queue", err);
              }
        }
        
        socketRef.current.onmessage = (e) => {
            console.log("Recieved new data from WS", JSON.parse(e.data))

            try {
                const parsedMessage = JSON.parse(e.data); // Parse the incoming WebSocket message
                console.log("Parsed message:", parsedMessage); // Debug the parsed message
        
                // Check if the message is for the current driver
                if (parsedMessage.type === "driver" && parsedMessage.id === driver.id.toString()) {
                    console.log("Message is for the current driver.");
        
                    // POTENTIAL IMPLEMENTATIONS

                    setDriver((prevDriver) => ({
                        ...prevDriver,
                        queue_length: parsedMessage.queue_length,
                    }));

                    const message = {
                        driverId: Number(driver.id),  // driver's ID
                        action: "getActiveQueues",
                    };
                
                    try {
                        setTimeout(() => {
                            socketRef.current.send(JSON.stringify(message));
                        }, 100);
                        console.log("Sent message:", message);
                    } catch (err) {
                        console.error("Failed to update queue", err);
                    }

                    console.log("Driver's info updated:", driver);
                    
                }

                if (parsedMessage.type === "driver_queue") {
                    console.log("Received driver queue data:", parsedMessage.data);
                    const userList = parsedMessage.data;  // Extract the user data from the message
    
                    // Update the connected users list with the queue data
                    setFilteredUsers(userList);  // Assuming you're updating the queue for the driver
                    console.log("Filtered Users:", userList);
                    setDriver((prevDriver) => ({
                        ...prevDriver,
                        queue_length: filteredUsers.length,
                    }));
                }
        
                // Update the connected users if necessary
                else if (Array.isArray(parsedMessage)) {
                    const userList = parsedMessage;
                    if (JSON.stringify(previousUsers.current) !== JSON.stringify(userList)) {
                        setConnectedUsers(userList);
                        previousUsers.current = userList;

                    //     // const filtered = userList.filter(
                    //     //     (user) => Number(user.driver_id) === Number(driver.id)
                    //     // );
            
                    //     // console.log("Filtered Users:", filtered);
                    //     // setFilteredUsers(filtered);
                    
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        }

        return () => {
            socketRef.current.close();
        };
    }, [driver?.id, driver?.username, driver?.phone_number]);


//     // Send message to WebSocket after driver info or queue length updates
  useEffect(() => {
    if (socketRef.current) {
      const message = {
        driverId: Number(driver.id),  // driver's ID
        action: "getActiveQueues",
      };

      try {
        socketRef.current.send(JSON.stringify(message));
        console.log("Sent message:", message);
      } catch (err) {
        console.error("Failed to update queue", err);
      }
    } else {
      console.log("WebSocket not open, retrying...");
      // Optionally, you could retry sending the message after a delay, or queue it for later
    }
  }, [driver.queue_length, connectedUsers]);

    // Wait until the driver data is available before rendering
    // Show loading until the driver data is fetched
    return(
        <>
            <div>
                <h1>Driver Information</h1>
                <p><strong>Name:</strong> {driver.username}</p>
                <p><strong>Phone Number:</strong> {driver.phone_number}</p>
                <p><strong>Driver ID:</strong> {driver.id}</p>
                <p><strong>Real Queue Length:</strong> {filteredUsers.length}</p>
            </div>
            <h1><strong>QUEUE: {filteredUsers.length}</strong></h1>
            <br></br>
            <ul>
                {/* Render the first person in the queue if it exists */}
                {filteredUsers.length > 0 && (
                    <div>
                        <CurrentQueuePassengerInfoCard
                            key={0}
                            name={filteredUsers[0].username}
                            phone={filteredUsers[0].phoneNumber}
                            location={filteredUsers[0].pickupLocation}
                            destination={filteredUsers[0].dropoffLocation}
                            socket={socketRef.current}
                            riderId={filteredUsers[0].riderId}
                            driverId={driver.id}
                        />
                    </div>
                )}
                

                {/* {filteredUsers.map((user, index) => (
                    <div>
                        <CurrentQueuePassengerInfoCard
                        key={index}
                        name={user.username}
                        phone={user.phone_number}
                        location={user.pickup_location}
                        destination={user.dropoff_location}
                        socket={socketRef.current}
                        riderId={user.id}
                        driverId={driver.id}
                        />
                    </div>
                ))} */}

                <QueueTable
                filteredUsers={filteredUsers}
                />

            </ul>
        </>
    );   
};
