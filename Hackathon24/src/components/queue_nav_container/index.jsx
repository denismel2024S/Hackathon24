import React, { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';

import withReactContent from 'sweetalert2-react-content';


const MySwal = withReactContent(Swal);

const ButtonContainer = ({riderId, driverId, socket,arrivedAtPickup, setArrivedAtPickup}) => {
  const [arrivedAtDestination, setArrivedAtDestination] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location);

  const currentPassenger = { name: 'John Doe' }; // Example passenger data

   // Update current location dynamically
   

  const handleArrivedPickup = () => {
    MySwal.fire({
      title: 'Confirm Arrival',
      text: `Are you sure you have arrived at the pickup location for ${currentPassenger.name}?`,
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
          action: "queueStatusUpdate",
          message: "Arrived at the designated pickup location.",
        };

        try {
            // Send WebSocket message to the server
            socket.send(JSON.stringify(message));
            console.log(message);

            // Update state after the action
            setArrivedAtPickup(true);
            MySwal.fire('Confirmed!', 'You have arrived at the pickup location.', 'success');
        } catch (err) {
            console.error("Failed to update queue", err);
            setError("Failed to update the queue. Please try again.");  // Error handling
        }
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

  const handleGoBack = () => {
    console.log("Go Back clicked");
  };

  const handleBackToDashboard = () => {
    console.log("Back to Dashboard clicked");
  };

  return (
    <div>
      {!arrivedAtPickup && (
        <button
            id="arrived-pickup"
            className="btn btn-primary mt-3"
            onClick={handleArrivedPickup}
        >
            Arrived at Pickup
        </button>
      )}

      {arrivedAtPickup && !arrivedAtDestination && (
        <button
            id="arrived-destination"
            className="btn btn-success mt-3"
            onClick={handleArrivedDestination}
        >
          Arrived at Destination
        </button>
      )}

      {/* <button
        id="go-back"
        className="btn btn-warning mt-3"
        onClick={handleGoBack}
      >
        Previous
      </button>

      {arrivedAtDestination && (
        <button
          id="back-to-dashboard"
          className="btn btn-danger mt-3"
          onClick={handleBackToDashboard}
        >
          Go Back
        </button>
      )} */}
    </div>
  );
};

export default ButtonContainer;
