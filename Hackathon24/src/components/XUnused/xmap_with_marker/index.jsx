import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';

const MapWithMarker = ({ address, initialCoordinates, onCoordinatesChange, socket, updateRiderData, setPickupCoordinates }) => {
  const [center, setCenter] = useState(initialCoordinates || { lat: 37.2296, lng: -80.4244 }); // Default coordinates
  const [markerPosition, setMarkerPosition] = useState(initialCoordinates);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc', // Replace with your API key
  });

  useEffect(() => {
    if (address && !initialCoordinates) {
      const geocodeAddress = async () => {
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc` // Replace with your API key
          );
          const location = response.data.results[0].geometry.location;
          setCenter(location);
          setMarkerPosition(location);
          onCoordinatesChange(location); // Notify parent about initial coordinates
          
        } catch (error) {
          console.error('Error geocoding address:', error);
        }
      };

      geocodeAddress();
    }
  }, [address, initialCoordinates, onCoordinatesChange]);

  const handleDragEnd = (e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(newPosition);
    onCoordinatesChange(newPosition); // Notify parent about updated coordinates
    
  };

  const handleSendCoordinates = async () => {
    setLoading(true);
    try {
      const message = {
        action: 'riderPickupCoordinateUpdate',
        coordinates: markerPosition,
      };

      socket.send(JSON.stringify(message));

      updateRiderData({
        pickupCoordinates: markerPosition,
      })
      
      console.log('Rider location updated:', message);
    } catch (error) {
      console.error('Error sending coordinates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: '100%', height: '400px' }}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={handleDragEnd}
          />
        )}
      </GoogleMap>

      <button
        onClick={handleSendCoordinates}
        style={{ marginTop: '10px' }}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Confirm Pickup Location'}
      </button>
    </div>
  );
};

export default MapWithMarker;
