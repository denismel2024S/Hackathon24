import React, { useState} from "react";

const DriverInfoCard = ({ driver, riderId, socket, rider, inQueue, setInQueue, updateRiderData }) => {
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);

    // Update the front-end UI when the rider's queue status changes

    const handleQueueAction = async (event) => {
        event.preventDefault(); // Prevent the default form submission
        setJoining(true);
        
        const message = {
            driverId: driver.id,  // driver's ID
            riderId: rider.id,    // rider's ID
        };

        try {
            if (inQueue) {
                // If rider is already in the queue, end the queue
                message.action = "endQueue";

                updateRiderData({
                    driver_id: null, // Rider is leaving the queue, so we reset driver_id
                  });

            } else {
                // If rider is not in the queue, join the queue
                message.action = "joinQueue";

                updateRiderData({
                    driver_id: String(driver.id), // Rider is leaving the queue, so we reset driver_id
                });
            }

            // Send WebSocket message to the server
            socket.send(JSON.stringify(message));
            console.log(message);

            // Update state after the action
            setInQueue(!inQueue)
        } catch (err) {
            console.error("Failed to update queue", err);
            setError("Failed to update the queue. Please try again.");  // Error handling
        } finally {
            setJoining(false); // Reset the joining state
        }
    };


    //const { username, id, phone_number, queue_length } = driver; // Destructure properties from the `driver` object

    return (
        <div className="driverInfoCard">
            <h3>{driver.username}: 
                <span className = "queueNumber" data = {driver.queue_length}> {driver.queue_length} </span>in Queue</h3>
            <h4>Shift: {driver.shift}</h4>
            <div className="card-body">
                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleQueueAction}
                    disabled={joining}
                >
                    {joining ? 'Processing...' : inQueue ? 'End Queue' : 'Join Queue'}
                </button>
                {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>
        </div>
    );
};

export default DriverInfoCard;
