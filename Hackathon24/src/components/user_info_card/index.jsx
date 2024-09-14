import React from "react";

const UserInfoCard = () => {
    return (
        <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
            <i className="bi bi-cart"></i>
          </div>
          <div className="ps-3">
            <div id="driver-info">
              <h3 className="card-title" id="driver-name">Name</h3>
              <p><b>Queue Position</b></p>
              <p id="driver-arrival">Arrival Time</p>
              <p id="driver-phone">Phone number</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default UserInfoCard;