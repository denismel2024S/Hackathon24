import React, { useState, useEffect, useRef } from "react";
import CurrentQueuePassengerInfoCard from "../current_queue_passenger_info_card";
import axios from "axios";
import MapCard from "../map_card"
import MapWithDirections from "../map_with_directions";
import ButtonContainer from "../queue_nav_container";


export function PageDriver({formData}) {
    const [connectedUsers, setConnectedUsers] = useState([])
    const previousUsers = useRef([])
    const socketRef = useRef(null);

    // dummy locations for map
    const pickupLocation = { lat: 37.22404604170506, lng: -80.418091260216 };
    const destination = { lat: 37.24309222144794, lng:  -80.42563313338609 };

    const [passenger, setPassenger] = useState(null);
    const [driver, setDriver] = useState(null);

    
    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary


    const fetchDriverByPhone = async (phoneNumber) => {
        try {
          console.log("attempting to retrieve a driver's data....")
          const response = await axios.get(`/api/driver/by-phone/${phoneNumber}`);
          if (response.data) {
            console.log("Driver data fetched successfully:", response.data);
            setDriver(response.data);

          } else {
            console.log("Driver not found");
          }
        } catch (error) {
          console.error("Error fetching driver ID:", error);
        }
    };

    
    useEffect(() => {
        fetchDriverByPhone(formData.phone);
    }, [formData.phone]); // Dependency array ensures this only runs when formData.phone changes
    

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
        const fetchPassengerData = async () => {

            try {
                // Mock data for testing
                const mockData = {
                    name: "John Doe",
                    phone: "+1234567890",
                    location: "575 Washington St SW, Blacksburg",
                    destination: "Kabrich Crescent Blacksburg, VA"
                };
                setPassenger(mockData);
            } catch (error) {
                console.error('Error fetching passenger data:', error);
            }

    
        };

        fetchPassengerData();
        //TEMPORARY!!! NOT THE PARAMETERS FOR A DRIVER  
        const queryParams = new URLSearchParams({
            type: "driver",
            username: formData.name.toString(), //(account.user.firstName + account.user.lastName),
            phoneNumber: formData.phone, 
            queue: 0

        }).toString()
        const WSURL = `ws://localhost:8080?${queryParams}`
        socketRef.current = new WebSocket(WSURL)

        socketRef.current.onopen = () => {
            console.log('Websocket connection established')
        }
        
        socketRef.current.onmessage = (e) => {
            const userList = JSON.parse(e.data)
            console.log("Recieved new data from WS")

            if(JSON.stringify(previousUsers.current) !== JSON.stringify(userList)){
                setConnectedUsers(userList)
                previousUsers.current = userList;
            }
        }

        return () => {
            socketRef.current.close();
        };
    }, [formData]);

    // Wait until the driver data is available before rendering
    // Show loading until the driver data is fetched
    if (!driver) {
        fetchDriverByPhone(formData.phone);
    }
    if (!driver) {
        return <h1>Loading driver information...</h1>; 
    }

    if (!passenger) {
        return <div>Loading...</div>;
    }

    const filteredUsers = connectedUsers.filter(
        (user) => user.driverId === driver.id // if the driver id is set to the driver's phone number
    )
    
    return(
        <>
        <div>
            <h1>Driver Information</h1>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone Number:</strong> {formData.phone}</p>
            <p><strong>Driver ID:</strong> {driver.id}</p>

        </div>
        <h1><strong>QUEUE: {filteredUsers.length}</strong></h1>
        <ul>
                {filteredUsers.map((user, index) => (
                    <div>
                        <CurrentQueuePassengerInfoCard
                        key={index}
                        name={user.username}
                        phone={user.phoneNumber}
                        location={user.pickupLocation}
                        destination={user.dropoffLocation}
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
