import React, { useState, useEffect } from "react";

const DriverInfoCard = ({ username, queueLength, phoneNumber, driverId, socket, riderId, inQueue }) => {
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(inQueue);  // Use `inQueue` prop to determine initial state
    const [error, setError] = useState(null);

    // Update the front-end UI when the rider's queue status changes
    useEffect(() => {
        setJoined(inQueue);
    }, [inQueue]);

    
    const handleQueueAction = async (event) => {
        event.preventDefault(); // Prevent the default form submission
        setJoining(true);
        
        const message = {
            driverId: driverId,  // driver's ID
            riderId: riderId,    // rider's ID
        };

        try {
            if (joined) {
                // If rider is already in the queue, end the queue
                message.action = "endQueue";
            } else {
                // If rider is not in the queue, join the queue
                message.action = "joinQueue";
            }

            // Send WebSocket message to the server
            socket.send(JSON.stringify(message));
            console.log(message);

            // Update state after the action
            setJoined(!joined);  // Toggle between join and leave state
        } catch (err) {
            console.error("Failed to update queue", err);
            setError("Failed to update the queue. Please try again.");  // Error handling
        } finally {
            setJoining(false); // Reset the joining state
        }
    };

    return (
        <div className="col">
            <div className="card mb-4 rounded-3 shadow-sm">
                <div className="card-header py-3">
                    <h4 className="my-0 fw-normal">{username}</h4>
                </div>
                <div className="card-body">
                    <h2 className="card-title pricing-card-title">{queueLength} in Queue</h2>
                    <button
                        className="btn btn-primary d-inline-flex align-items-center btn-join-queue"
                        type="button"
                        onClick={handleQueueAction} // Handle join or leave
                        disabled={joining}
                    >
                        {joining ? 'Processing...' : joined ? 'End Queue' : 'Join Queue'}
                    </button>
                    {error && <div className="alert alert-danger mt-2">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default DriverInfoCard;
