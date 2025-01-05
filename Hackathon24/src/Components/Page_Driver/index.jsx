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

    // dummy locations for map
    const pickupLocation = { lat: 37.22404604170506, lng: -80.418091260216 };
    const destination = { lat: 37.24309222144794, lng:  -80.42563313338609 };

    const [passenger, setPassenger] = useState(null);

    
    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary



    /**
     *  Repeated WebSocket Connections
        Error: The WebSocket opens multiple times because the useEffect depends on formData 
        (which can change frequently).

        Cause: The formData object being passed into the dependency array could be unstable 
        or getting re-created on each render.

        Fix: Use JSON.stringify(formData) in the dependency array or memoize formData to avoid 
        unnecessary re-renders.

        useEffect(() => {
            const queryParams = new URLSearchParams({
                type: "driver",
                username: formData.name,
                phoneNumber: formData.phone, 
                queue: 0
            }).toString();

            const WSURL = `ws://localhost:8080?${queryParams}`;
            const socket = new WebSocket(WSURL);

            socket.onopen = () => {
                console.log('WebSocket connection established');
            };
            
            socket.onmessage = (e) => {
                const userList = JSON.parse(e.data);
                console.log("Received new data from WebSocket");
                if (JSON.stringify(previousUsers.current) !== JSON.stringify(userList)) {
                    setConnectedUsers(userList);
                    previousUsers.current = userList;
                }
            };

            return () => {
                socket.close();
            };
        }, [JSON.stringify(formData)]);

     */

    useEffect(() => {
        // Fetch passenger data from an API or other source

        //TEMPORARY!!! NOT THE PARAMETERS FOR A DRIVER  


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
