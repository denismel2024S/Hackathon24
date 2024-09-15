import React, { useState, useEffect } from "react";
import CurrentQueuePassengerInfoCard from "../current_queue_passenger_info_card";
import MapCard from "../map_card"

const Page_Driver = () => {

    const [passenger, setPassenger] = useState(null);

    useEffect(() => {
        // Fetch passenger data from an API or other source
        const fetchPassengerData = async () => {

            try {
                // Mock data for testing
                const mockData = {
                    name: "John Doe",
                    phone: "+1234567890",
                    location: "123 Elm Street",
                    destination: "456 Oak Avenue"
                };
                // Simulate a delay
                setTimeout(() => {
                    setPassenger(mockData);
                }, 1000); // 1 second delay
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
        <div className="container">
            <CurrentQueuePassengerInfoCard
            name={passenger.name}
            phone={passenger.phone}
            location={passenger.location}
            destination={passenger.destination}
            />
            <MapCard/>
        </div>
    );   
};


export default Page_Driver;