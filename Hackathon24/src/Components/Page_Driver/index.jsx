import React, { useState, useEffect, useRef } from "react";
import CurrentQueuePassengerInfoCard from "../current_queue_passenger_info_card";
import axios from "axios";
import MapCard from "../map_card"
import MapWithDirections from "../map_with_directions";
import ButtonContainer from "../queue_nav_container";


export function PageDriver({formData, driver, setDriver, socket}) {
    const [connectedUsers, setConnectedUsers] = useState([])
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
    
        socketRef.current.onopen = () => {
            console.log('Websocket connection established')
        }
        
        socketRef.current.onmessage = (e) => {
            const userList = JSON.parse(e.data)
            console.log("Recieved new data from WS", JSON.parse(e.data))

            if(JSON.stringify(previousUsers.current) !== JSON.stringify(userList)){
                setConnectedUsers(userList)
                previousUsers.current = userList;

                const filtered = userList.filter(
                    (user) => Number(user.driver_id) === Number(driver.id)
                );
    
                console.log("Filtered Users:", filtered);
                setFilteredUsers(filtered);
            }
        }

        return () => {
            socketRef.current.close();
        };
    }, [driver]);

    // Wait until the driver data is available before rendering
    // Show loading until the driver data is fetched
    if (!driver) {
        return <h1>Loading driver information...</h1>; 
    }
    return(
        <>
            <div>
                <h1>Driver Information</h1>
                <p><strong>Name:</strong> {driver.username}</p>
                <p><strong>Phone Number:</strong> {driver.phone_number}</p>
                <p><strong>Driver ID:</strong> {driver.id}</p>
                <p><strong>Real Queue Length:</strong> {driver.queue_length}</p>
            </div>
            <h1><strong>QUEUE: {filteredUsers.length}</strong></h1>
            <ul>
                {filteredUsers.map((user, index) => (
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
                ))}
            </ul>
        </>
    );   
};
