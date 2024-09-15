// LocationForm.js
import React, { useState } from 'react';

const LocationForm = ({ onSubmit }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit({ pickup, destination });
    } else {
      console.error('onSubmit is not a function');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="pickup">Pickup Location</label>
        <input
          type="text"
          id="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Enter pickup location"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="destination">Destination</label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination"
          required
        />
      </div>
      <button type="submit">Save Locations</button>
    </form>
  );
};

export default LocationForm;
