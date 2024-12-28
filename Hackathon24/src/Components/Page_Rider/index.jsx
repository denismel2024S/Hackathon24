import React, { useState, useEffect, useRef } from "react";
import DriverInfoCardContainer from "../driver_info_card_container";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import RiderMap from "../rider_map";
import useWebSocket from 'react-use-websocket'
import throttle from 'lodash.throttle'

export function PageRider({formData}){
    const [connectedUsers, setConnectedUsers] = useState([])
    const previousUsers = useRef([])
    const socketRef = useRef(null);

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
        }
        socketRef.current.onmessage = (e) => {
            const userList = JSON.parse(e.data)
            if(JSON.stringify(previousUsers.current) !== JSON.stringify(userList)){

                setConnectedUsers(userList)
                previousUsers.current = userList

            }

        }
        return () => {
            socketRef.current.close();
        };

    }, [formData])

    console.log('Form Data:', formData)
    console.log('In the PageRider component')

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
                <DriverInfoCardContainer
                connectedUsers = {connectedUsers}
                socket={socketRef.current}
                riderId = {formData.name}
                />
            </div>
        </>
    )
}