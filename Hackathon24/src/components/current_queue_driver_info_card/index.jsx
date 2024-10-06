import React from "react";

const CurrentQueueDriverInfoCard = ({name, queue_position, phone, account}) => {

  const handleLeaveQueue = async (event) => {
    event.preventDefault(); // Prevent the default form submission
    const riderId = account.id;
    try {
        // Replace with your backend API endpoint
        const response = await fetch(`http://localhost:5433/api/leave-queue/${riderId}`,{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json', // Set the appropriate content type
            }
        });
        // Check if the response is okay (status in the range 200-299)
        if (response.ok) {
            const data = await response.json(); // Parse the JSON response
            // Handle success (e.g., update UI or notify user)
            console.log(data.message);
        } else {
            const errorData = await response.json();
            setError(`Failed to leave the queue: ${errorData.message}`);
        }
        } catch (err) {
        setError('Failed to leave the queue. Please try again.');
        console.error(err);
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
              <h3 className="card-title" id="driver-name">Your Driver: {name}</h3>
              <p><b>Queue Position: {queue_position}</b></p>
              <p id="driver-phone">Phone number: {phone}</p>
            </div>
            <button type="button" onClick={handleLeaveQueue}>Leave Queue</button>
          </div>
        </div>
      </div>
    </div>
    )
}

export default CurrentQueueDriverInfoCard;