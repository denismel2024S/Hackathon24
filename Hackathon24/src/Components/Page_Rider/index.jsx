import React, { useState, useEffect, useRef } from "react";
import DriverInfoCardContainer from "../driver_info_card_container";
import axios from "axios";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import RiderMap from "../rider_map";
import useWebSocket from 'react-use-websocket'
import throttle from "lodash.throttle";


export function PageRider({formData, rider, setRider, updateRiderData}){
    const socketRef = useRef(null);
    const previousUsers = useRef([])
    const [connectedUsers, setConnectedUsers] = useState([])
    const [inQueue, setInQueue] = useState(null);  // State to store rider's state
    const [driver, setDriver] = useState(null); // Start as null for better checks

    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary

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

        const WSURL = `ws://localhost:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)

        socketRef.current.onopen = () => {
            console.log('Websocket connection established')
        }

        socketRef.current.onmessage = (e) => {
            console.log("Raw message from server:", e.data); // Debug the raw message


            const userList = JSON.parse(e.data)
            console.log("Parsed user list:", userList); // Debug the parsed user list

            if (JSON.stringify(previousUsers.current) !== JSON.stringify(userList)) {
                setConnectedUsers(userList);
                previousUsers.current = userList;
            }
        }

        return () => {
            socketRef.current.close();
        };
    }, [rider?.id, rider?.username, rider?.phone_number, rider?.pickup_location, rider?.dropoff_location,]);



    // FETCH DRIVER INFO FROM DB IF INQUEUE CHANGES TO TRUE AND RIDER.DRIVER_ID IS SET AS NON NULL
    useEffect(() => {
        if (rider.driver_id && inQueue) {
            fetchDriverInfoById(rider.driver_id);
        }
    }, [inQueue, rider.driver_id]);

    // TEST USEEFFECT

    // Set `inQueue` state based on `rider.driver_id`
    useEffect(() => {
        if (!rider.driver_id){
            setInQueue(false);
        } else {
            setInQueue(true)
        }
    }, [rider.driver_id]);


    console.log('Form Data:', formData);
    console.log('In the PageRider component');

    console.log(rider);

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
                        {!driver?.id ? (
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