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
            <div className="card-body">
                <div id="driver-info">
                    <div className="row">
                        <div className="d-flex align-items-center">
                            <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                                <i className="bi bi-cart"></i>
                            </div>
                            <div className="ps-3">
                                <div id="driver-info">
                                    <h2 className="card-title" id="passenger-name">{name}</h2>
                                    <p id="passenger-phone">Phone: {phone}</p>
                                    <p id="passenger-location">Pickup From: {location}</p>
                                    <p id="passenger-destination">Going to: {destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br></br>
                    {/* Buttons */}
                    <div className="map-buttons">
                        <div>
                            <button
                                id="google-maps-button"
                                className="btn btn-success"
                                onClick={() => handleButtonClick(googleMapsUrl)}
                            >
                                Open in Google Maps
                            </button>
                        </div>
                        

                        {/* Arrived at Pickup and Arrived at Destination Buttons */}

                        <ButtonContainer
                            key={riderId}
                            riderId={riderId}
                            driverId={driverId}
                            socket={socket}
                            arrivedAtPickup={arrivedAtPickup}
                            setArrivedAtPickup={setArrivedAtPickup}
                        >
                            <button
                                id="google-maps-button"
                                className="btn btn-success"
                                onClick={() => handleButtonClick(googleMapsUrl)}
                            >
                                Open in Google Maps
                            </button>
                        </ButtonContainer>

                        {/* <button
                            id="waze-button"
                            className="btn btn-primary"
                            onClick={() => handleButtonClick(wazeUrl)}
                        >
                            Open in Waze
                        </button> */}
                        
                        {/* <button
                            id="apple-maps-button"
                            className="btn btn-info"
                            onClick={() => handleButtonClick(appleMapsUrl)}
                        >
                            Open in Apple Maps
                        </button> */}
                    </div>

                    
                </div>
            </div>
            {/* <div>
            <MapWithDirections pickupLocation={driverLocation} destination={currentLocation} />
            </div> */}
        </div>
    );
};

export default CurrentQueuePassengerInfoCard;
