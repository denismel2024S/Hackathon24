import React, { useState, useEffect } from "react";
import CurrentQueueInfoCard from "../current_queue_info_card";
import Map from "../Map"

const Page_Driver = () => {

    const [passenger, setPassenger] = useState(null);

    useEffect(() => {
        // Fetch passenger data from an API or other source
        const fetchPassengerData = async () => {
        try {
            const response = await fetch('/api/passenger'); // Replace with your API endpoint
            const data = await response.json();
            setPassenger(data);
        } catch (error) {
            console.error('Error fetching passenger data:', error);
        }
        };

        fetchPassengerData();
    }, []);

    if (!passenger) {
        return <div>Loading...</div>;
    }
    
    return(
        <div classname="container">
            <CurrentQueueInfoCard
            name={passenger.name}
            phone={passenger.phone}
            location={passenger.location}
            destination={passenger.destination}
            />
            <Map></Map>
        </div>
    )   
}


export default Page_Driver;