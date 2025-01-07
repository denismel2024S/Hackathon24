// LocationForm.js
import React, { useState, useEffect } from 'react';
import MapWithDirections from './MapWithDirections';
const LocationForm = ({ onSubmit }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get the user's current location
  useEffect(() => {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPickup(`${latitude}, ${longitude}`);
          setLoading(false);
        },
        (error) => {
          setError('Unable to retrieve location');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5432/location-form', {
        method: 'POST', // Assuming you are using POST method for location
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pickup, destination }),
      });
      

      if (response.ok) {
        const data = await response.json();
        console.log('Pickup/Dropoff location changed: ', data);
        // handle a successful location change
      } else {
        console.error('Error changing location: ', response.statusText);
        // handling location errors
      }
    } catch (error) {
      console.error('Location update failed: ', error);
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="pickup">Pickup Location </label>
        <input
          type="text"
          id="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Enter pickup location"
          required
          disabled={loading}
        />
        {loading && <p>Fetching your location...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="destination">Destination </label>
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
      <div>
      <MapWithDirections
        pickupLocation={pickup}
        destination={destination}
        />
    </div>
    </form>
    
  );
};

export default LocationForm;
