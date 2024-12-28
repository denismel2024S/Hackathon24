import React from "react";

const CurrentQueuePassengerInfoCard = ({ name, phone, location, destination }) => {
    // Create URL templates for each mapping service
    const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(location)}&navigate=yes`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
    const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(location)}`;

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
                </div>
            </div>
        </div>
    );
};

export default CurrentQueuePassengerInfoCard;