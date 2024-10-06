import React, { useState } from "react";

const DriverInfoCard = ({ name, queueLength, phone, pickupLocation, destination, driverId, account }) => {
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);

    const handleJoinQueue = async (event) => {
        event.preventDefault(); // Prevent the default form submission
        setJoining(true);
        const riderId = account.id;
        try {
            // Replace with your backend API endpoint
            const response = await fetch(`http://localhost:5433/api/join-queue/${riderId}/${driverId}`,{
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
                setError(`Failed to join the queue: ${errorData.message}`);
            }
            } catch (err) {
            setError('Failed to join the queue. Please try again.');
            console.error(err);
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
