import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MapWithDirections from "../map_with_directions";
import ButtonContainer from "../queue_nav_container";

const MySwal = withReactContent(Swal);

const CurrentQueuePassengerInfoCard = ({ name, phone, location, destination, riderId, driverId, socket}) => {
    const [arrivedAtPickup, setArrivedAtPickup] = useState(false);
    const [arrivedAtDestination, setArrivedAtDestination] = useState(false);

    // Logic to determine current location (pickup or destination)
    const currentLocation = arrivedAtPickup ? destination : location;
    const driverLocation = arrivedAtPickup ? location : destination;

    // Create URL templates for each mapping service
    const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(currentLocation)}&navigate=yes`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentLocation)}`;
    const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(currentLocation)}`;

    const handleButtonClick = (url) => {
        window.open(url, '_blank');
    };

    const handleArrivedPickup = () => {
        MySwal.fire({
            title: 'Confirm Arrival',
            text: `Are you sure you have arrived at the pickup location for ${name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, arrived!'
        }).then((result) => {
            if (result.isConfirmed) {
                setArrivedAtPickup(true);
                MySwal.fire('Confirmed!', 'You have arrived at the pickup location.', 'success');
            }
        });
    };

    const handleArrivedDestination = () => {
        MySwal.fire({
            title: 'Confirm Arrival',
            text: `Are you sure ${name} has reached their destination?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, arrived!'
        }).then((result) => {
            if (result.isConfirmed) {
                const message = {
                    driverId: driverId,  // driver's ID
                    riderId: riderId,    // rider's ID
                    action: "endQueue",
                };
        
                try {
                    // Send WebSocket message to the server
                    socket.send(JSON.stringify(message));
                    console.log(message);
        
                    // Update state after the action
                    setArrivedAtDestination(true);
                    MySwal.fire('Confirmed!', 'You have arrived at the destination.', 'success');
                } catch (err) {
                    console.error("Failed to update queue", err);
                    setError("Failed to update the queue. Please try again.");  // Error handling
                }
                
            }
        });

        
        
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

                    {/* Map Buttons */}
                    <div className="map-buttons">
                        <button
                            id="waze-button"
                            className="btn btn-primary"
                            onClick={() => handleButtonClick(wazeUrl)}
                        >
                            Open in Waze
                        </button>
                        <button
                            id="google-maps-button"
                            className="btn btn-success"
                            onClick={() => handleButtonClick(googleMapsUrl)}
                        >
                            Open in Google Maps
                        </button>
                        <button
                            id="apple-maps-button"
                            className="btn btn-info"
                            onClick={() => handleButtonClick(appleMapsUrl)}
                        >
                            Open in Apple Maps
                        </button>
                    </div>

                    {/* Arrived at Pickup and Arrived at Destination Buttons */}

                    <ButtonContainer
                        key={riderId}
                        riderId={riderId}
                        driverId={driverId}
                        socket={socket}
                    />
                </div>
            </div>
            {/* <div>
            <MapWithDirections pickupLocation={driverLocation} destination={currentLocation} />
            </div> */}
        </div>
    );
};

export default CurrentQueuePassengerInfoCard;
