import React, { useState, useEffect, useRef } from "react";
import DriverInfoCardContainer from "../driver_info_card_container";
import axios from "axios";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import RiderMap from "../rider_map";
import useWebSocket from 'react-use-websocket'
import throttle from "lodash.throttle";
// import { fetchRiderByPhone } from "../../../../Server/server";


export function PageRider({formData}){
    const [connectedUsers, setConnectedUsers] = useState([])
    const [riderUUID, setRiderUUID] = useState(null);
    const [inQueue, setInQueue] = useState(null);  // State to store rider's queue position
    const previousUsers = useRef([])
    const socketRef = useRef(null);

    // CHANGE IN DEVELOPMENT
    const [riderId, setRiderId] = useState(null);
    const [rider, setRider] = useState(null);


    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary


    const fetchRiderByPhone = async (phoneNumber) => {
        try {
          console.log("attempting to retrieve a rider's data....")
          const response = await axios.get(`/api/rider/by-phone/${phoneNumber}`);
          if (response.data) {
            console.log("Rider data fetched successfully:", response.data);
            setRider(response.data);
            if (!(!rider.driver_id)){
                setInQueue(false)
            }
            console.log(rider.id)

          } else {
            console.log("Rider not found");
          }
        } catch (error) {
          console.error("Error fetching rider ID:", error);
        }
    };

    
    useEffect(() => {
        fetchRiderByPhone(formData.phone);
    }, [formData.phone]); // Dependency array ensures this only runs when formData.phone changes
    

    //queryParams adds ? to the url with the params
    //implement auto reconnection module ; read documentation
    useEffect(() => {
        const queryParams = new URLSearchParams({
            type: "rider",
            username: formData.name,
            phoneNumber: formData.phone,
            pickupLocation: formData.pickup,
            dropoffLocation: formData.dropoff,
            driverId: undefined,
        }).toString();

        const WSURL = `ws://localhost:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)

        socketRef.current.onopen = () => {
            console.log('Websocket connection established')
            fetchRiderByPhone(formData.phone)
        }

        socketRef.current.onmessage = (e) => {
            console.log("Raw message from server:", e.data); // Debug the raw message

            const userList = JSON.parse(e.data)
            console.log("Parsed user list:", userList); // Debug the parsed user list

            if (JSON.stringify(previousUsers.current) !== JSON.stringify(userList)) {
                setConnectedUsers(userList);
                previousUsers.current = userList;


                // // Check for rider and set the riderUUID
                // const rider = userList.find(user => user.phoneNumber === formData.phone);
                // if (rider) {
                //     console.log("Found rider:", rider); // Debug to ensure correct data
                //     setRiderId(rider.id);
                //     setRiderUUID(rider.uuid);  // Set the rider's UUID
                // } else {
                //     console.log("riderId not found");
                // }

                // // Determine if rider is in queue based on the presence of driverId

                // // "does there exist some user with phone # matching provided phone #, AND is their driverId attribute non null"
                // const inQueue = userList.some(user => user.id === rider.id && user.driverId != null);
                // setInQueue(inQueue); // Set true if rider has a driverId, otherwise false
            }
        }

        return () => {
            socketRef.current.close();
        };
    }, [formData]);


    console.log('Form Data:', formData);
    console.log('In the PageRider component');

    console.log(rider);

    return (
        <>
            <div >
                <h1>Rider Information Submitted</h1>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Phone Number:</strong> {formData.phone}</p>
                <p><strong>Pickup Location:</strong> {formData.pickup}</p>
                <p><strong>Dropoff Location:</strong> {formData.dropoff}</p>
                <br/>
                <h1><strong>Drivers</strong></h1>
                <h1><strong>{rider && rider.id === null ? "loading..." : rider?.id}</strong></h1>

                <DriverInfoCardContainer
                connectedUsers = {connectedUsers}
                socket={socketRef.current}
                riderId = {rider && rider.id === null ? 0 : rider?.id}
                inQueue={inQueue}
                />
            </div>
        </>
    )
}