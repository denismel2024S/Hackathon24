import React, { useState } from "react";
import axios from "axios"; // Ensure you have axios installed or use your preferred method for HTTP requests

const DriverInfoCard = ({ name, queueLength, phone, pickupLocation, destination, driverId }) => {
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);

    const handleJoinQueue = async () => {
        setJoining(true);
        try {
            // Replace with your backend API endpoint
            const response = await axios.post('/api/join-queue', {
                driverId,
                pickupLocation,
                destination,
            });

            // Handle success (e.g., update UI or notify user)
            console.log(response.data.message);
        } catch (err) {
            setError('Failed to join the queue. Please try again.');
            console.error(err);
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="col">
            <div className="card mb-4 rounded-3 shadow-sm">
                <div className="card-header py-3">
                    <h4 className="my-0 fw-normal">{name}</h4>
                </div>
                <div className="card-body">
                    <h2 className="card-title pricing-card-title">{queueLength} in Queue</h2>
                    <ul className="list-unstyled mt-3 mb-4">
                        <li>Phone number: {phone}</li>
                    </ul>
                    <button
                        className="btn btn-primary d-inline-flex align-items-center btn-join-queue"
                        type="button"
                        onClick={handleJoinQueue}
                        disabled={joining}
                    >
                        {joining ? 'Joining...' : 'Join Queue'}
                    </button>
                    {error && <div className="alert alert-danger mt-2">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default DriverInfoCard;
