import React from "react";
import PropTypes from "prop-types";

const QueueTable = ({ driverQueue }) => {
  return (
    <div className="driver-queue-container">
      <table className="queue-table">
        <thead>
          <tr>
            <th>Q#</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Pickup Location</th>
            <th>Dropoff Location</th>
          </tr>
        </thead>
        <tbody>
          {driverQueue.map((user, index) => (
            <tr key={user.queue_id}>
              <td className="queue-number">{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.pickupLocation}</td>
              <td>{user.dropoffLocation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

QueueTable.propTypes = {
  driverQueue: PropTypes.arrayOf(
    PropTypes.shape({
      queueId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      riderId: PropTypes.number.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      pickupLocation: PropTypes.string.isRequired,
      dropoffLocation: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default QueueTable;
