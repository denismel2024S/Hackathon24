import React, { useState, useEffect } from "react";
import CurrentQueuePassengerInfoCard from "../current_queue_passenger_info_card";
import MapCard from "../map_card"
import MapWithDirections from "../map_with_directions";
import ButtonContainer from "../queue_nav_container";

const Page_Driver = ({ account }) => {

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
            <MapWithDirections pickupLocation={pickupLocation} destination={destination} />
            <ButtonContainer/>
        </div>
    );   
};


export default Page_Driver;