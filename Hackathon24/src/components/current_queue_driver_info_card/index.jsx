import React from "react";

const CurrentQueueDriverInfoCard = ({name, queue_position, phone}) => {
    return (
        <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-cart"></i>
          </div>
          <div className="ps-3">
            <div id="driver-info">
              <h3 className="card-title" id="driver-name">{name}</h3>
              <p><b>Queue Position: {queue_position}</b></p>
              <p id="driver-phone">Phone number: {phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default CurrentQueueDriverInfoCard;