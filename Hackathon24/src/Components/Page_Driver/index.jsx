import React, { useState, useEffect, useRef } from "react";
import CurrentQueuePassengerInfoCard from "../current_queue_passenger_info_card";
import MapCard from "../map_card"
import MapWithDirections from "../map_with_directions";
import ButtonContainer from "../queue_nav_container";


export function PageDriver({formData}) {
    const [connectedUsers, setConnectedUsers] = useState([])
    const previousUsers = useRef([])
    //console.log(account.user.userId)
    //console.log(account.user.email)
    //console.log(account.user.username)
    //console.log(account.user.firstName)
    //console.log(account.user.lastName)

    //HOW TO GET INFORMATION FOR ACCOUNT OBJECT???????????

    // dummy locations for map
    const pickupLocation = { lat: 37.22404604170506, lng: -80.418091260216 };
    const destination = { lat: 37.24309222144794, lng:  -80.42563313338609 };

    const [passenger, setPassenger] = useState(null);

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
            phoneNumber: formData.phone.toString(), 
            queue: 0

        }).toString()
        const WSURL = `ws://localhost:8080?${queryParams}`
        const socket = new WebSocket(WSURL)
        socket.onopen = () => {
            console.log('Websocket connection established')
        }
        socket.onmessage = (e) => {
            const userList = JSON.parse(e.data)
            console.log("Recieved new data from WS")

            // filtering so that only riders with driverId matching this user's username will be shown

            const username = formData.name;
            // const filteredUsers = userList
            const filteredUsers = userList.filter(
                (user) => user.driverId === username
            )

            if(JSON.stringify(previousUsers.current) !== JSON.stringify(filteredUsers)){
                setConnectedUsers(filteredUsers)
                previousUsers.current = filteredUsers
            }
        }

        return () => {
            socket.close();
        };
    }, [formData]);

    if (!passenger) {
        return <div>Loading...</div>;
    }
    
    return(
        <>
        <div>
            <h1>Driver Information</h1>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Phone Number:</strong> {formData.phone}</p>
        </div>
        <h1><strong>QUEUE: {connectedUsers.length}</strong></h1>
        <ul>
                {connectedUsers.map((user, index) => (
                    <div>
                        <CurrentQueuePassengerInfoCard
                        key={index}
                        name={user.username}
                        phone={user.phoneNumber}
                        location={user.pickupLocation}
                        destination={user.dropoffLocation}
                        />
                    </div>
                ))}
            </ul>
        <div className="container">
            <MapWithDirections pickupLocation={pickupLocation} destination={destination} />
            <ButtonContainer/>
        </div>
        </>
    );   
};
