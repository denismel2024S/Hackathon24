import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ButtonContainer from "../ButtonContainer";

const MySwal = withReactContent(Swal);

const CurrentQueuePassengerInfoCard = ({ name, phone, location, destination, riderId, driverId, socket}) => {
    const [arrivedAtPickup, setArrivedAtPickup] = useState(false);
    const [arrivedAtDestination, setArrivedAtDestination] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(location);

    useEffect(() => {
        setCurrentLocation(arrivedAtPickup ? destination : location);
      }, [arrivedAtPickup, location, destination]);
    
    // Logic to determine current location (pickup or destination)

    // Create URL templates for each mapping service
    const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(currentLocation)}&navigate=yes`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentLocation)}`;
    const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(currentLocation)}`;

    const handleButtonClick = (url) => {
        window.open(url, '_blank');
    };
    return (
        <div className="card">
            <div className = "infoContainer">
                <p className = "currentPassengerName"><strong>{name}</strong></p>
                {/* <p>Phone: {phone}</p> */}
                <a className = "clickablePhone" href={`tel:${phone}`}><i class="fa-solid fa-phone"></i>{phone}</a>
                <p>Pickup From: {location}</p>
                <p>Going to: {destination}</p>
            </div>
            {/* Buttons */}
            <div className="mapButtons">
                
                {/* Arrived at Pickup and Arrived at Destination Buttons */}
                <ButtonContainer
                    key={riderId}
                    riderId={riderId}
                    driverId={driverId}
                    socket={socket}
                    arrivedAtPickup={arrivedAtPickup}
                    googleMapsUrl={googleMapsUrl}
                    setArrivedAtPickup={setArrivedAtPickup}
                    phone={phone}>
                    
                </ButtonContainer>
            </div>
        </div>
    );
};

export default CurrentQueuePassengerInfoCard;
