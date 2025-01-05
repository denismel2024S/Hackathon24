import React, { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';

import withReactContent from 'sweetalert2-react-content';


const MySwal = withReactContent(Swal);

const CurrentQueueDriverInfoCard = ({rider, driver, setDriver, setRider, inQueue, setInQueue, socket, updateRiderData}) => {

const handleLeaveQueue = async (event) => {
  event.preventDefault(); // Prevent the default form submission
  
  MySwal.fire({
    title: 'Confirm Leave Queue',
    text: `Are you sure you want to leave the queue?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, leave!'
  }).then((result) => {
    if (result.isConfirmed) {
      const message = {
        driverId: driver.id,  // driver's ID
        riderId: rider.id,    // rider's ID
        action: "endQueue",
      };
    
      try {
    
        updateRiderData({
          driver_id: null, // Rider is leaving the queue, so we reset driver_id
        });
    
        // Send WebSocket message to the server
        socket.send(JSON.stringify(message));
        console.log(message);
    
        // Update state after the action
        setInQueue(!inQueue);  // Toggle between join and leave state
      } catch (err) {
        console.error("Failed to update queue", err);
      }

    }
  });
  
};

    return (
        <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-cart"></i>
          </div>
          <div className="ps-3">
            <div id="driver-info">
              <h3 className="card-title" id="driver-name"><b>Your Driver: </b>{driver.username} <b>(ID: {driver.id})</b></h3>
              <p><b>Queue Length: </b>{Number(driver.queue_length) + 1}</p>
              <p><b>Queue Position: </b>N/A</p>
              <p><b>Queue Status: </b>N/A</p>

              <p id="driver-phone"><b>Phone number: </b>{driver.phone_number}</p>

            </div>
            <button 
            type="button" 
            onClick={handleLeaveQueue}
            disabled={!inQueue}
            >
              {inQueue ? 'Leave Queue' : 'Leaving...'}
            </button>
          </div>
        </div>
      </div>
    </div>
    )
}

export default CurrentQueueDriverInfoCard;