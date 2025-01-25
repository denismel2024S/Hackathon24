import React from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './index.css';


const MySwal = withReactContent(Swal);

const CurrentQueueDriverInfoCard = ({queuePosition, status, rider, driver, inQueue, setInQueue, socket, updateRiderData}) => {

  const handleLeaveQueue = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    
    MySwal.fire({
      title: 'Confirm Leave Queue',
      text: `Are you sure you want to leave the queue?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, leave!',
      heightAuto: false        // Prevent adjusting the body's height
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

  function getOrdinalSuffix(num) {
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = num % 10;

    // Determine the appropriate suffix based on the last digit and handle exceptions
    const suffix = (num > 3 && num < 21) ? suffixes[0] : suffixes[lastDigit] || suffixes[0];

    return `${num}${suffix} `;
  }

  return (
      <div className="currentDriver">
        <h3>Your Driver: {driver.username} (ID: {driver.id})</h3>
        {/* <p><b>Phone number: </b>{driver.phone_number}</p> */}
        <h3>You are <span className = "queueNumber" data={queuePosition}>{getOrdinalSuffix(queuePosition)}</span> in queue</h3>
        <p><b>Queue Status: </b>{status}</p>
        <a className = "clickablePhone" href={`tel:${driver.phone}`}>
          <i class="fa-solid fa-phone"></i>
          <b>{driver.phone_number}</b></a>
        <button 
          className = "leaveQueueButton"
          type="button" 
          onClick={handleLeaveQueue}
          disabled={!inQueue}
        >
          {inQueue ? 'Leave Queue' : 'Leaving...'}
        </button>
      </div>
  );
}

export default CurrentQueueDriverInfoCard;
