import React, { useState, useEffect, useRef } from "react";
import CurrentQueuePassengerInfoCard from "../CurrentQueuePassengerInfoCard";
import QueueTable from "../QueueTable";
import {Reset} from "../Reset";
//import './index.css';

export function PageDriver({formData, driver, setDriver, socket, updateDriverData}) {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const previousUsers = useRef([])
    const socketRef = useRef(null);
    
    useEffect(() => {

        // Fetch passenger data from an API or other source

        const queryParams = new URLSearchParams({
            type: "driver",
            id: driver?.id,
            username: driver?.username,
            phone_number: driver?.phone_number,
            queue_length: driver?.queue_length,
        }).toString();

        //const WSURL = `ws://localhost:8080?${queryParams}`
        const WSURL = `ws://192.168.1.45:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)
        window.localStorage.setItem('driver', JSON.stringify(driver));
    
        socketRef.current.onopen = () => {
            console.log('Websocket connection established')
        }
        
        socketRef.current.onmessage = (e) => {
            console.log("Recieved new data from WS", JSON.parse(e.data))

            try {
                const parsedMessage = JSON.parse(e.data); // Parse the incoming WebSocket message
                console.log("Parsed message:", parsedMessage); // Debug the parsed message
        
                // Check if the message is for the current driver
                if (parsedMessage.type === "driver") {
                    console.log("Message is for the current driver.", parsedMessage);
        
                    // POTENTIAL IMPLEMENTATIONS

                    // setDriver((prevDriver) => ({
                    //     ...prevDriver,
                    //     queue_length: parsedMessage.queue_length,
                    //     id: parsedMessage.id,
                    // }));

                    updateDriverData({
                        queue_length: parsedMessage.queue_length, // Rider is leaving the queue, so we reset driver_id
                        id: parsedMessage.id,
                    });

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
    }, [driver?.username, driver?.phone_number]);


//     // Send message to WebSocket after driver info or queue length updates
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        if(driver.id){
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
      
    } else {
      console.log("WebSocket not open, retrying...");
      // Optionally, you could retry sending the message after a delay, or queue it for later
    }
  }, [driver.queue_length, connectedUsers]);

    // Wait until the driver data is available before rendering
    // Show loading until the driver data is fetched
    return(
        <div className = "pageDriver">
            <h1 className = "greeting"><strong>Hello, </strong> {driver.username}</h1>
            <h2 className = "queue"><strong>QUEUE: {filteredUsers.length}</strong></h2>
            <div className="driverInformation">
                <p><strong>Phone Number:</strong> {driver.phone_number}</p>
                <p><strong>Driver ID:</strong> {driver.id}</p>
                <p><strong>Real Queue Length:</strong> {filteredUsers.length}</p>
            </div>
            <ul>
                {/* Render the first person in the queue if it exists */}
                {filteredUsers.length > 0 && (
                    <div className = "queueList">
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
                        <QueueTable driverQueue={filteredUsers}/>
                    </div>
                )}
            </ul>
            <Reset/>
        </div>
    );   
};
