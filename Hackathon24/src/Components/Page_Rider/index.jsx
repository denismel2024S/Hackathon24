import React, { useState, useEffect } from "react";
import DriverInfoCardContainer from "../driver_info_card_container";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import RiderMap from "../rider_map";

export function PageRider({username}){
    //queryParams adds ? to the url with the params
    //implement auto reconnection module ; read documentation

    const WSURL = 'ws://localhost:8080'
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WSURL, {
        queryParams: {username}
    })
    //const THROTTLE = 50//milliseconds 1s = 1000
    console.log(typeof sendJsonMessage)
    const sendJsonMessageThrottle = useRef(throttle(sendJsonMessage, 50)) 
    useEffect(() => {
        sendJsonMessage({
            x: 0,
            y: 0
        })
        window.addEventListener('mousemove', e => {
            sendJsonMessageThrottle.current({
                x: e.clientX,
                y: e.clientY
            })
        })

    }, [])

    return (
      <h1>Hello ${username} </h1>
    )
}