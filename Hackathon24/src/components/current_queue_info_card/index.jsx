import React from "react";

const CurrentQueueInfoCard = ({name, phone, location, destination}) => {
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
                  <p id="passenger-phone">{phone}</p>
                  <p id="passenger-location">{location}</p>
                  <p id="passenger-destination">{destination}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="map-buttons">
            <button id="waze-button" className="btn btn-primary">
              Open in Waze
            </button>
            <button id="google-maps-button" className="btn btn-success">
              Open in Google Maps
            </button>
            <button id="apple-maps-button" className="btn btn-info">
              Open in Apple Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
    
export default CurrentQueueInfoCard;