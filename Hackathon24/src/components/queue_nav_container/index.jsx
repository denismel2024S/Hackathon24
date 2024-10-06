import React, { useState } from 'react';
import Swal from 'sweetalert2';

import withReactContent from 'sweetalert2-react-content';


const MySwal = withReactContent(Swal);

const ButtonContainer = () => {
  const [arrivedAtPickup, setArrivedAtPickup] = useState(false);
  const [arrivedAtDestination, setArrivedAtDestination] = useState(false);
  const currentPassenger = { name: 'John Doe' }; // Example passenger data

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
        setArrivedAtPickup(true);
        MySwal.fire('Confirmed!', 'You have arrived at the pickup location.', 'success');
      }
    });
  };

  const handleArrivedDestination = () => {
    MySwal.fire({
      title: 'Confirm Arrival',
      text: `Are you sure ${currentPassenger.name} has reached their destination?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, arrived!'
    }).then((result) => {
      if (result.isConfirmed) {
        setArrivedAtDestination(true);
        MySwal.fire('Confirmed!', 'You have arrived at the destination.', 'success');
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
    <div className="arrived-back-button-container">
      <button
        id="arrived-pickup"
        className="btn btn-primary mt-3"
        onClick={handleArrivedPickup}
      >
        Arrived at Pickup
      </button>

      {arrivedAtPickup && (
        <button
          id="arrived-destination"
          className="btn btn-success mt-3"
          onClick={handleArrivedDestination}
        >
          Arrived at Destination
        </button>
      )}

      <button
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
      )}
    </div>
  );
};

export default ButtonContainer;
