import React from "react";

const DriverInfoCard = ({name, queueLength, phone}) => {
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
                >
                    Join Queue
                </button>
                </div>
            </div>
        </div>
        
  );
};

export default DriverInfoCard;