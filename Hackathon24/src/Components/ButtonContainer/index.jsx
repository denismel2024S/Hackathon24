import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import './index.css';

import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ButtonContainer = ({googleMapsUrl, riderId, driverId, socket,arrivedAtPickup, setArrivedAtPickup, phone}) => {
  const [arrivedAtDestination, setArrivedAtDestination] = useState(false);

  const currentPassenger = { name: 'John Doe' }; // Example passenger data
  const riderTimeout = 15000; // 5 minutes in milliseconds

   // Update current location dynamically
   useEffect(() => {
    // Send queueStatusUpdate when the component loads
    const message = {
      driverId: driverId,  // driver's ID
      riderId: riderId,    // rider's ID
      action: "queueStatusUpdate",
      status: "in progress",
    };

    setArrivedAtPickup(false);

    try {
      socket.send(JSON.stringify(message));
      console.log("Sent status update on component load:", message);
    } catch (err) {
      console.error("Failed to send status update on component load:", err);
    }
  }, [driverId, riderId, socket]); // Run this effect when these values change


  const handleArrivedPickup = () => {
    MySwal.fire({
      title: 'Confirm Arrival',
      text: `Are you sure you have arrived at the pickup location for ${currentPassenger.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#de6451',
      confirmButtonText: 'Call rider',
      heightAuto: false        // Prevent adjusting the body's height
    }).then((result) => {
      window.open(`tel:${phone}`, '_self');
      if (result.isConfirmed) {
        setArrivedAtPickup(true);

        const message = {
          driverId: driverId,  // driver's ID
          riderId: riderId,    // rider's ID
          action: "queueStatusUpdate",
          status: "Arrived At Rider's Location",
        };

        try {
            // Send WebSocket message to the server
            socket.send(JSON.stringify(message));
            console.log(message);

            // Update state after the action
            MySwal.fire('Confirmed!', 'You have arrived at the pickup location.', 'success');
        } catch (err) {
            console.error("Failed to update queue", err);
            setError("Failed to update the queue. Please try again.");  // Error handling
        }
        callLoop();
      }
    });
  };
  const endQueue = () => {
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
      // MySwal.fire('Confirmed!', 'You have arrived at the destination.', 'success');
    } catch (err) {
      console.error("Failed to update queue", err);
      setError("Failed to update the queue. Please try again.");  // Error handling
    }
  };
  const callLoop = (initialCall = true) => {
    let timer = initialCall ? riderTimeout : Swal.getTimerLeft(); // 5 minutes in milliseconds or remaining time

    MySwal.fire({
      title: 'Confirm Pickup',
      text: 'Did the rider pickup? \nRider will be removed in 5 minutes if they do not pickup.',
      html: 'Time remaining: <b></b>',
      didOpen: () => {
      const b = MySwal.getPopup().querySelector('b');
      setInterval(() => {
        const timeLeft = MySwal.getTimerLeft();
        if (timeLeft >= 120000) {
        b.textContent = `${Math.floor(timeLeft / 60000)} minutes`;
        }else if (timeLeft >= 60000) {
        b.textContent = `${Math.floor(timeLeft / 60000)} minute`;
        } else {
        b.textContent = `${(timeLeft / 1000).toFixed(0)} seconds`;
        }
      }, 1000);
      },
      icon: 'question',
      showDenyButton: true,
      confirmButtonColor: '#4caf50',
      denyButtonColor: '#de6451',
      confirmButtonText: 'Yes',
      denyButtonText: 'Call again',
      timerProgressBar: true,
      timer: timer,
      heightAuto: false        // Prevent adjusting the body's height
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire('Confirmed!', 'Make your way to the destination', 'success');
      } else if (Swal.isTimerRunning() == false) {
        MySwal.fire({
          title: 'Remove Rider',
          text: 'The rider did not pick up. Do you want to remove the rider?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#de6451',
          cancelButtonColor: '#4caf50',
          confirmButtonText: 'Remove',
          cancelButtonText: 'Keep Waiting',
          heightAuto: false
        }).then((result) => {
          if (result.isConfirmed) {
            MySwal.fire('Rider removed', 'Rider has been removed', 'success');
            endQueue();
          }else{
            callLoop(true);
          }
        });
      } else { // call again
        window.open(`tel:${phone}`, '_self');
        callLoop(false);
      }
    });
  };



  const handleArrivedDestination = () => {
    MySwal.fire({
      title: 'Confirm Arrival',
      text: `Are you sure you have arrived at your riders destination?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#de6451',
      confirmButtonText: 'Yes',
      heightAuto: false        // Prevent adjusting the body's height
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire('Confirmed!', 'Thanks for a safe ride', 'success');
        endQueue();
      }
    })
  };

  const handleGoBack = () => {
    console.log("Go Back clicked");
  };

  const handleBackToDashboard = () => {
    console.log("Back to Dashboard clicked");
  };

  return (
    <div>
      {/* <button
        id="google-maps-button"
        className="google-maps-button"
        onClick={() => handleButtonClick(googleMapsUrl)}>
        Google Maps
    </button> */}
      {!arrivedAtPickup && (
        <button
            className = "updateStatus"
            id="arrived-pickup"
            onClick={handleArrivedPickup}
        >
            Arrived at Pickup
        </button>
      )}

      {arrivedAtPickup && !arrivedAtDestination && (
        <button
            className = "updateStatus"
            id="arrived-destination"
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
