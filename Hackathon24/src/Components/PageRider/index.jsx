import React, { useState, useEffect, useRef } from "react";
import DriverInfoCardContainer from "../DriverInfoCardContainer";
import axios from "axios";
import CurrentQueueDriverInfoCard from "../CurrentQueueDriverInfoCard";


export function PageRider({formData, rider, setRider, updateRiderData}){
    const socketRef = useRef(null);
    const previousUsers = useRef([])
    const [connectedUsers, setConnectedUsers] = useState([])
    const [inQueue, setInQueue] = useState(false);  // State to store rider's state
    const [driver, setDriver] = useState(null); // Start as null for better checks
    const [queue, setQueue] = useState(null); // Queue status 

    //axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary
    axios.defaults.baseURL = 'http://192.168.1.45:5433'; // Replace with your server's base URL if necessary

    const fetchDriverInfoById = async (driverId) => {
        try {
            const response = await axios.get(`/api/driver/by-id/${driverId}`);
            if (response.data) {
                setDriver({
                    id: response.data.id,
                    username: response.data.username,
                    phone_number: response.data.phone_number,
                    queue_length: response.data.queue_length,
                });
            } else {
                setDriver(null);
            }
        } catch (error) {
            console.error("Error fetching driver data:", error);
        }
    };
    

    //queryParams adds ? to the url with the params
    //implement auto reconnection module ; read documentation
    useEffect(() => {
        const queryParams = new URLSearchParams({
            type: "rider",
            id: rider?.id,
            username: rider?.username,
            phone_number: rider?.phone_number,
            pickup_location: rider?.pickup_location,
            dropoff_location: rider?.dropoff_location,
            driver_id: rider?.driver_id,
        }).toString();

        //const WSURL = `ws://localhost:8080?${queryParams}`
        const WSURL = `ws://192.168.1.45:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)

        socketRef.current.onopen = () => {
            console.log('Websocket connection established')
        }

        socketRef.current.onmessage = (e) => {
            console.log("Raw message from server:", e.data); // Debug the raw message

            try {
                const parsedMessage = JSON.parse(e.data); // Parse the incoming WebSocket message
                console.log("Parsed message:", parsedMessage); // Debug the parsed message
        
                // Check if the message is for the current rider
                if (parsedMessage.type === "rider" && parsedMessage.id === rider.id.toString()) {
                    console.log("Message is for the current rider.");
        

                    console.log(parsedMessage.driver_id);
                    console.log(rider.driver_id);

                    updateRiderData({
                        driver_id: parsedMessage.driver_id, // Rider is leaving the queue, so we reset driver_id
                      });

                    console.log("Rider's driver_id updated:", parsedMessage.driver_id);

                }

                // Check if the message is for the current rider's queue
                if (parsedMessage.type === "rider_queue" && parsedMessage.data) {
                    console.log("Queue update for current rider:", parsedMessage.data);
        
                    // Update the queue state with the new data
                    setQueue((prevQueue) => ({
                    ...prevQueue,
                    ...parsedMessage.data, // Merge the new data with existing queue data
                    }));
        
                    console.log("Updated queue object:", parsedMessage.data);
                }
        
                // Update the connected users if necessary
                else if (Array.isArray(parsedMessage)) {
                    const userList = parsedMessage;
                    if (JSON.stringify(previousUsers.current) !== JSON.stringify(userList)) {
                        setConnectedUsers(userList);
                        previousUsers.current = userList;
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        }

        return () => {
            socketRef.current.close();
        };
    }, [rider?.id, rider?.username, rider?.phone_number, rider?.pickup_location, rider?.dropoff_location,]);



    // FETCH DRIVER INFO FROM DB IF INQUEUE CHANGES TO TRUE AND RIDER.DRIVER_ID IS SET AS NON NULL
    useEffect(() => {
        if (rider.driver_id) {
            fetchDriverInfoById(rider.driver_id);
            setInQueue(true);
        }else{
            setInQueue(false);
        } 
        window.localStorage.setItem('rider', JSON.stringify(rider));
        window.localStorage.setItem('queue', JSON.stringify(queue));
        window.localStorage.setItem('driver', JSON.stringify(driver));
        window.localStorage.setItem('inQueue', inQueue);
    }, [inQueue, rider.driver_id]);
    useEffect(() => {
        const rider = window.localStorage.getItem('rider');
        const inQueue = window.localStorage.getItem('inQueue');
        const queue = window.localStorage.getItem('queue');
        const driver = window.localStorage.getItem('driver');
        if (rider) {
            setInQueue(inQueue);
            setRider(JSON.parse(rider));
            setQueue(JSON.parse(queue));
            setDriver(JSON.parse(driver));
        }
    }, []);


    console.log('Form Data:', formData);
    console.log('In the PageRider component');
    console.log(inQueue)

    if (inQueue === null) {
        return <p>Loading...</p>; // Show loading state until `inQueue` is determined
    } 

    return(
        <div>
            <h1>Rider Information Submitted</h1>
            <p><strong>Name:</strong> {rider.username}</p>
            <p><strong>Phone Number:</strong> {rider.phone_number}</p>
            <p><strong>Pickup Location:</strong> {rider.pickup_location}</p>
            <p><strong>Dropoff Location:</strong> {rider.dropoff_location}</p>
            <p><strong>Rider ID:</strong> {rider.id}</p>
            <p><strong>Driver ID:</strong> {rider.driver_id === null ? "No driver id" : rider?.driver_id}</p>
            {inQueue ? (
                    <div>
                        {!driver?.id || !queue ? (
                            <div>
                                <p>Loading driver info..</p> 
                            </div>
                        ) : (
                            <div>
                                <CurrentQueueDriverInfoCard
                                    rider={rider}
                                    driver={driver}
                                    setDriver={setDriver}
                                    setRider={setRider}
                                    inQueue={inQueue}
                                    setInQueue={setInQueue}
                                    socket={socketRef.current}
                                    updateRiderData={updateRiderData}
                                    queuePosition={queue ? queue.position : "Loading..."}
                                    status={queue ? queue.status : "Loading..."}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <DriverInfoCardContainer
                    connectedUsers = {connectedUsers}
                    socket={socketRef.current}
                    rider = {rider === null ? 0 : rider}
                    inQueue={inQueue}
                    setInQueue={setInQueue}
                    setRider={setRider}
                    updateRiderData={updateRiderData}
                    />
                )}
        </div>
    )

}