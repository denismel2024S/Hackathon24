import React, { useState } from "react";

const DriverInfoCard = ({ username, queueLength, phoneNumber, pickupLocation, destination, driverId, account, socket, riderId }) => {
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState(null);

    const handleJoinQueue = async (event) => {
        event.preventDefault(); // Prevent the default form submission
        setJoining(true);

        try {
            // Send message to WebSocket server to join the queue
            const message = {
                action: "joinQueue",
                driverId: username, // driver's username
                riderId: riderId,   // rider's uuid
            };

            // Assuming WebSocket connection is stored in a `socket` variable
            socket.send(JSON.stringify(message));
            console.log(message);

            // Update state to indicate that the rider has joined
            setJoined(true);
        } catch (err) {
            console.error("Failed to join the queue", err);
            setError("Failed to join the queue. Please try again.");    // error handling
        } finally {
            setJoining(false); // Set isJoining to false after the request
        }
    };

    // Leave Queue Handler
    const handleLeaveQueue = async (event) => {
        event.preventDefault();
        setJoining(true);

        try {
            const message = {
                action: "leaveQueue",
                driverId: username, // driver's username
                riderId: riderId,   // rider's uuid
            };

            socket.send(JSON.stringify(message));
            console.log(message);

            setJoined(false);  // Update UI to reflect the rider has left the queue
        } catch (err) {
            console.error("Failed to leave the queue", err);
            setError("Failed to leave the queue. Please try again.");
        } finally {
            setJoining(false);
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
                    <ul className="list-unstyled mt-3 mb-4">
                        <h4 className="my-0 fw-normal">Phone number: {phoneNumber}</h4>
                    </ul>
                    <button
                        className="btn btn-primary d-inline-flex align-items-center btn-join-queue"
                        type="button"
                        onClick={joined ? handleLeaveQueue : handleJoinQueue} // Toggle button action
                        disabled={joining}
                    >
                        {joining ? 'Joining...' : joined ? 'Leave Queue' : 'Join Queue'}
                    </button>
                    {error && <div className="alert alert-danger mt-2">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default DriverInfoCard;
