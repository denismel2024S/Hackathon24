import React, { useState, useEffect, useRef } from "react";
import DriverInfoCardContainer from "../DriverInfoCardContainer";
import CurrentQueueDriverInfoCard from "../CurrentQueueDriverInfoCard";
import LocationChangeForm from "../XUnused/Xlocation_form";
import MapWithMarker from "../XUnused/xmap_with_marker";
import {Reset} from "../Reset"


export function PageRider({formData, rider, setRider, updateRiderData}){
    const socketRef = useRef(null);
    const previousUsers = useRef([])
    const [connectedUsers, setConnectedUsers] = useState([])
    const [inQueue, setInQueue] = useState(false);  // State to store rider's state
    const [driver, setDriver] = useState(null); // Start as null for better checks
    const [queue, setQueue] = useState(null); // Queue status 
    const [pickupCoordinates, setPickupCoordinates] = useState(null);



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
        // const WSURL = `ws://192.168.1.45:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)

        socketRef.current.onopen = () => {
            console.log('Websocket connection established')

            if(rider.driver_id){
                const message = {
                    driverId: rider.driver_id,  // driver's ID
                    riderId: rider.id,
                    action: "getDriverByPhoneNumber",
                };
            
                try {
                    socketRef.current.send(JSON.stringify(message));
                    console.log("Sent message:", message);
                } catch (err) {
                    console.error("Failed to retrieve rider's current driver", err);
                }
            }
        }

        socketRef.current.onmessage = (e) => {
            console.log("Raw message from server:", e.data); // Debug the raw message

            try {
                const parsedMessage = JSON.parse(e.data); // Parse the incoming WebSocket message
                console.log("Parsed message:", parsedMessage); // Debug the parsed message
        
                // Check if the message is for the current rider
                if (parsedMessage.type === "rider") {
                    console.log("Message is for the current rider.");

                    console.log(parsedMessage);
                    console.log(rider.driver_id);

                    // fix issues where server returns string "null" instead of null
                    const sanitizedDriverId = parsedMessage.driver_id === "null" ? null : Number(parsedMessage.driver_id);
                    
                    updateRiderData({
                        driver_id: sanitizedDriverId, // Rider is leaving the queue, so we reset driver_id
                        id: parsedMessage.id,
                      });

                    // UPDATE LOCAL RIDER'S LOCATION IF SENT

                    if (parsedMessage.pickup_location !== null || parsedMessage.dropoff_location !== null){
                        updateRiderData({
                            pickup_location: parsedMessage.pickup_location, // Rider is leaving the queue, so we reset driver_id
                            dropoff_location: parsedMessage.dropoff_location,
                        });
                    }


                    if (sanitizedDriverId !== null){
                        const message = {
                            driverId: sanitizedDriverId,  // driver's ID
                            riderId: rider.id,
                            action: "getDriverByPhoneNumber",
                        };
                    
                        try {
                            socketRef.current.send(JSON.stringify(message));
                            console.log("Sent message:", message);
                        } catch (err) {
                            console.error("Failed to retrieve rider's current driver", err);
                        }

                    }

                    console.log("Rider's driver_id updated:", parsedMessage.driver_id);


                }

                if (parsedMessage.type === "riderLocationRequest"){
                    console.log(`Driver ID: ${parsedMessage.driver_id} is requesting user's location data (including pickup coordinates)`);

                    // fix issues where server returns string "null" instead of null
                    const sanitizedDriverId = parsedMessage.driver_id === "null" ? null : Number(parsedMessage.driver_id);
                    
                      
                    const message = {
                        action: "sendRiderLocationToDriver",
                        driverId: sanitizedDriverId,  // driver's ID
                        pickup_location: rider.pickup_location,
                        pickup_coordinates: rider.pickupCoordinates, // POTENTIALLY NEEDS TO BE CHANGED TO SOMETHING LIKE rider.pickupCoordinates
                        dropoff_location: rider.dropoff_location,
                        riderId: rider.id,
                    };
                
                    try {
                        socketRef.current.send(JSON.stringify(message));
                        console.log("User (rider) sent location data:", message);
                    } catch (err) {
                        console.error("Failed to send rider's current location data", err);
                    }
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

                if (parsedMessage.type === "driver") {
                    console.log("Riders current driver info:", parsedMessage);
        
                    // Update the queue state with the new data
                    setDriver(parsedMessage.data);
        
                    console.log("Updated driver object:", parsedMessage.data);
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
    }, [rider?.id, rider?.username, rider?.phone_number]);

    


    // FETCH DRIVER INFO FROM DB IF INQUEUE CHANGES TO TRUE AND RIDER.DRIVER_ID IS SET AS NON NULL
    useEffect(() => {
        if (rider.driver_id && socketRef.current) {
            setInQueue(true);
            // const message = {
            //     driverId: rider.driver_id,  // driver's ID
            //     riderId: rider.id,
            //     action: "getDriverByPhoneNumber",
            // };
        
            // try {
            //     setTimeout(() => {
            //         socketRef.current.send(JSON.stringify(message));
            //     }, 100);
            //     console.log("Sent message:", message);
            // } catch (err) {
            //     console.error("Failed to retrieve rider's current driver", err);
            // }
        }else{
            setInQueue(false);
            setDriver(null);

        } 
        window.localStorage.setItem('rider', JSON.stringify(rider));
        window.localStorage.setItem('queue', JSON.stringify(queue));
        window.localStorage.setItem('driver', JSON.stringify(driver));
        window.localStorage.setItem('inQueue', inQueue);
    }, [inQueue, rider.driver_id]);

    useEffect(() => {
        
        window.localStorage.setItem('pickupCoordinates', JSON.stringify(pickupCoordinates));
    
    }, [pickupCoordinates]);

    useEffect(() => {
        const rider = window.localStorage.getItem('rider');
        const inQueue = window.localStorage.getItem('inQueue');
        const queue = window.localStorage.getItem('queue');
        const driver = window.localStorage.getItem('driver');
        const pickupCoordinates = window.localStorage.getItem('pickupCoordinates');
        if (rider) {
            setInQueue(inQueue);
            setRider(JSON.parse(rider));
            setQueue(JSON.parse(queue));
            setDriver(JSON.parse(driver));
            setPickupCoordinates(JSON.parse(pickupCoordinates))
        }
    }, []);


    console.log('Form Data:', formData);
    console.log('In the PageRider component');
    console.log(inQueue)

    if (inQueue === null) {
        return <p>Loading...</p>; // Show loading state until `inQueue` is determined
    } 

    return (
        <div className="pageDriver">
            {!rider.pickupCoordinates ? (
                <div>
                    {/* Render only the map when pickupCoordinates are not set */}
                    <MapWithMarker
                        address={rider.pickup_location}
                        initialCoordinates={null}
                        onCoordinatesChange={setPickupCoordinates}
                        socket={socketRef.current}
                        updateRiderData={updateRiderData}
                        setPickupCoordinates={setPickupCoordinates}
                    />
                    <Reset/>
                </div>
            ) : (
                <div>
                    {/* Render everything else if pickupCoordinates are set */}
                    <h1 className="greeting">Your ride is on the way, {rider.username}</h1>
                    <h1>Insert image here</h1>
                    <div className="riderInformation">
                        <p><strong>Phone Number:</strong> {rider.phone_number}</p>
                        <p><strong>Pickup Location:</strong> {rider.pickup_location}</p>
                        <p><strong>Pickup Coordinates:</strong> Lat: {pickupCoordinates?.lat === null ? "N/A" : pickupCoordinates?.lat}, Long: {pickupCoordinates?.lng === null ? "N/A" : pickupCoordinates?.lng}</p>
                        <p><strong>Rider Object's Pickup Coordinates:</strong> Lat: {rider.pickupCoordinates?.lat === null ? "N/A" : rider.pickupCoordinates?.lat}, Long: {rider.pickupCoordinates?.lng === null ? "N/A" : rider.pickupCoordinates?.lng}</p>
                        <p><strong>Dropoff Location:</strong> {rider.dropoff_location}</p>
                        <p><strong>Rider ID:</strong> {rider.id}</p>
                        <p><strong>Driver ID:</strong> {rider.driver_id === null ? "No driver id" : rider?.driver_id}</p>
                        <p><strong>In Queue:</strong> {inQueue === true ? "True" : "False"}</p>
                    </div>
                    {inQueue ? (
                        <div>
                            {!driver?.id || !queue ? (
                                <div>
                                    <p>Loading driver info...</p>
                                </div>
                            ) : (
                                <div>
                                    {queue.position > 1 && (
                                        <LocationChangeForm
                                            riderId={rider.id}
                                            socket={socketRef.current}
                                            updateRiderData={updateRiderData}
                                            pickupCoordinates={pickupCoordinates}
                                            setPickupCoordinates={setPickupCoordinates}
                                        />
                                    )}
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
                        <div>
                            <DriverInfoCardContainer
                                connectedUsers={connectedUsers}
                                socket={socketRef.current}
                                rider={rider === null ? 0 : rider}
                                inQueue={inQueue}
                                setInQueue={setInQueue}
                                setRider={setRider}
                                updateRiderData={updateRiderData}
                            />
                            <LocationChangeForm
                                riderId={rider.id}
                                socket={socketRef.current}
                                updateRiderData={updateRiderData}
                                pickupCoordinates={pickupCoordinates}
                                setPickupCoordinates={setPickupCoordinates}
                            />
                        </div>
                    )}
                    <Reset />
                </div>
            )}
        </div>
    );

}