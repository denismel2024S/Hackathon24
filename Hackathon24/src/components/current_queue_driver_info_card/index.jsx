import React, { useState, useEffect, useRef } from "react";

const CurrentQueueDriverInfoCard = ({rider, driver, setDriver, setRider, inQueue, setInQueue, socket, updateRiderData}) => {

//   const handleLeaveQueue = async (event) => {
//     event.preventDefault(); // Prevent the default form submission
//     const riderId = rider.id;
//     try {
//         // Replace with your backend API endpoint
//         const response = await fetch(`http://localhost:5433/api/leave-queue/${riderId}`,{
//             method: 'POST',
//             headers:{
//                 'Content-Type': 'application/json', // Set the appropriate content type
//             }
//         });
//         // Check if the response is okay (status in the range 200-299)
//         if (response.ok) {
//             const data = await response.json(); // Parse the JSON response
//             // Handle success (e.g., update UI or notify user)
//             console.log(data.message);
//         } else {
//             const errorData = await response.json();
//             setError(`Failed to leave the queue: ${errorData.message}`);
//         }
//         } catch (err) {
//         setError('Failed to leave the queue. Please try again.');
//         console.error(err);
//     }
    
// };




useEffect(() => {
  setDriver(driver);

}, [driver]);


useEffect(() => {
  setRider(rider);

}, [rider]);

const handleLeaveQueue = async (event) => {
  event.preventDefault(); // Prevent the default form submission
  
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
              <h3 className="card-title" id="driver-name"><b>Your Driver: {driver.username}</b></h3>
              <p><b>Queue Position: </b>not implemented yet</p>
              <p id="driver-phone"><b>Phone number: </b>{driver.phone_number}</p>
              <p id="driver-id"><b>ID: </b>{driver.id}</p>

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