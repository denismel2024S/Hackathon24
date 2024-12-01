import React, { useState, useEffect, useRef } from "react";
import DriverInfoCardContainer from "../driver_info_card_container";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import RiderMap from "../rider_map";
import useWebSocket from 'react-use-websocket'
import throttle from 'lodash.throttle'

//const renderUsersList = users => {
    //return (
        //<ul>
            //{Object.keys(users).map(uuid => {
                //return <li key={uuid} >{JSON.stringify(users[uuid])}</li>
            //})}
        //</ul>
    //)
//}
export function PageRider({formData}){
    const [connectedUsers, setConnectedUsers] = useState([])
    const previousUsers = useRef([])
    //queryParams adds ? to the url with the params
    //implement auto reconnection module ; read documentation
    useEffect(() => {
        const queryParams = new URLSearchParams({
            type: "rider",
            username: formData.name,
            phoneNumber: formData.phone,
            pickupLocation: formData.pickup,
            dropoffLocation: formData.dropoff
        }).toString();
        const WSURL = `ws://localhost:8080?${queryParams}`
        const socket = new WebSocket(WSURL)
        socket.onopen = () => {
            console.log('Websocket connection established')
        }
        socket.onmessage = (e) => {
            const userList = JSON.parse(e.data)
            if(JSON.stringify(previousUsers.current) !== JSON.stringify(userList)){

                setConnectedUsers(userList)
                previousUsers.current = userList

            }

        }

    }, [formData])


    //const {sendJsonMessage, lastJsonMessage} = useWebSocket(WSURL, {
        //queryParams: {username}
    //})
    //const THROTTLE = 50//milliseconds 1s = 1000
    console.log('Form Data:', formData)
    console.log('In the PageRider component')

    //const sendJsonMessageThrottle = useRef(throttle(sendJsonMessage, 50)) 
    //useEffect(() => {
        //sendJsonMessage({
            //x: 0,
            //y: 0
        //})
        //window.addEventListener('mousemove', e => {
            //sendJsonMessage({
                //x: e.clientX,
                //y: e.clientY
            //})
        //})

    //}, [])

    return (
        <div>
            <h1>Rider Information Submitted</h1>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone Number:</strong> {formData.phone}</p>
            <p><strong>Pickup Location:</strong> {formData.pickup}</p>
            <p><strong>Dropoff Location:</strong> {formData.dropoff}</p>
            <br/>
            <h1><strong>Drivers</strong></h1>
            <ul>
                {connectedUsers.map((user, index) => (
                    <li key = {index}>
                        <p>Name: {user.username}</p>
                        <p>Phone Number: {user.phoneNumber}</p>
                        <p>Current Queue: {user.queue}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}