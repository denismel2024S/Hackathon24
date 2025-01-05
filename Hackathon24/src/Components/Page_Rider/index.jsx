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


export function PageRider({formData, rider, setRider, updateRiderData}){
    const socketRef = useRef(null);
    const previousUsers = useRef([])
    const [connectedUsers, setConnectedUsers] = useState([])
    const [inQueue, setInQueue] = useState(null);  // State to store rider's state

    // CHANGE IN DEVELOPMENT
    // const [driver, setDriver] = useState({
    //     id: null,
    //     username: '',
    //     phone_number: '',
    //     queue_length: 0,
    // });    


    // TEST ENV CONSTANTS
    const [driver, setDriver] = useState(null); // Start as null for better checks




    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary

    

    // const fetchDriverInfoById = (driverId) => {
    //     try {
    //         if(inQueue){
    //             console.log("attempting to retrieve a driver's data....")
    //             const response = axios.get(`/api/driver/by-id/${driverId}`);
    //             if (response.data){
    //                 console.log("Driver data fetched successfully:", response.data);
    //                 // setDriver(response.data);

    //                 const newDriverData = {
    //                     id: response.data.id,
    //                     username: response.data.username,
    //                     phone_number: response.data.phone_number,
    //                     queue_length: response.data.queue_length,
    //                 };

    //                 updateDriverData(newDriverData);

    //             } else {
    //                 setDriver(null);
    //             }
    //         }
    //     } catch (error) {
    //       console.error("Error fetching rider ID:", error);
    //     }
    // };

    // TEST FUNCTION
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

    // const updateDriverData = (newData) => {
    //     setDriver(prevState => ({
    //         ...prevState,
    //         ...newData
    //     }));
    // };


    // useEffect(() => {
    //     setRider(rider);

    //     if (rider.driver_id === null){
    //         setInQueue(false);
    //     } else {
    //         setInQueue(true);
    //     }
    // }, [rider]);

    

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

    // {!driver?.id ? (
    //     <div>
    //         <p>Loading driver info...</p>; // Driver data not yet fetched
    //     </div>
    // ) : (
    //     <div>

    //     </div>
    // )}


    // if (inQueue) {
    //     if (!driver?.id) {
    //         return <p>Loading driver info...</p>; // Driver data not yet fetched
    //     }

    //     return (
    //         <div>
    //             <h1>Rider Information Submitted</h1>
    //             <p><strong>Name:</strong> {rider.username}</p>
    //             <p><strong>Phone Number:</strong> {rider.phone_number}</p>
    //             <p><strong>Pickup Location:</strong> {rider.pickup_location}</p>
    //             <p><strong>Dropoff Location:</strong> {rider.dropoff_location}</p>
    //             <p><strong>Rider ID:</strong> {rider.id}</p>
    //             <p><strong>Driver ID:</strong> {rider.driver_id === null ? "No driver id" : rider?.driver_id}</p>
    //             <CurrentQueueDriverInfoCard
    //                 rider={rider}
    //                 driver={driver}
    //                 setDriver={setDriver}
    //                 setRider={setRider}
    //                 inQueue={inQueue}
    //                 setInQueue={setInQueue}
    //                 socket={socketRef.current}
    //                 updateRiderData={updateRiderData}
    //             />
    //         </div>
            
    //     );
    // }

    // return (
    //     <div>
    //         <h1>Rider Information Submitted</h1>
    //         <p><strong>Name:</strong> {rider.username}</p>
    //         <p><strong>Phone Number:</strong> {rider.phone_number}</p>
    //         <p><strong>Pickup Location:</strong> {rider.pickup_location}</p>
    //         <p><strong>Dropoff Location:</strong> {rider.dropoff_location}</p>
    //         <p><strong>Rider ID:</strong> {rider.id}</p>
    //         <p><strong>Driver ID:</strong> {rider && rider.driver_id === null ? "No driver id" : rider?.driver_id}</p>
    //         <br></br>
    //         <h1><strong>Drivers</strong></h1>
    //         <DriverInfoCardContainer
    //             connectedUsers={connectedUsers}
    //             socket={socketRef.current}
    //             rider={rider || {}}
    //             inQueue={inQueue}
    //             setInQueue={setInQueue}
    //             setRider={setRider}
    //             updateRiderData={updateRiderData}
    //         />
    //     </div>
        
    // );

    // return (
    //     <>
    //         <div >
                

    //             <br/>
    //             <h1><strong>Drivers</strong></h1>
    //             <h1><strong></strong></h1>
    //             <p>{inQueue ? "USER IS IN A QUEUE" : "USER IS NOT IN A QUEUE" }</p>
    //             {driver === null ? (
    //                 <div>Loading....</div>
    //             ) : (
                    
    //                 <div>
    //                     <p>Driver: {rider.driver_id}</p>
    //                 <CurrentQueueDriverInfoCard 
    //                     rider={rider}
    //                     riderId={rider?.id}
    //                     setRider={setRider}
    //                     driver={driver}
    //                     setDriver={setDriver}
    //                     inQueue={inQueue}
    //                     setInQueue={setInQueue}
    //                     socket={socketRef.current}
    //                     />  
    //                 </div>
    //             )}
                
    //             {inQueue ? (
    //                 <p>User is in a Queue</p>
    //             ) : (
    //                 <DriverInfoCardContainer
    //                 connectedUsers = {connectedUsers}
    //                 socket={socketRef.current}
    //                 rider = {rider === null ? 0 : rider}
    //                 inQueue={inQueue}
    //                 setInQueue={setInQueue}
    //                 setRider={setRider}
    //                 />
    //             )}
    //         </div>
    //     </>
    // )
}