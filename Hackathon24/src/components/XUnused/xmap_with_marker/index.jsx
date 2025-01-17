import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import { drop } from 'lodash';

const MapWithMarker = ({ riderId, address, initialCoordinates, destination, destinationCoordinates, onCoordinatesChange, socket, updateRiderData, setPickupCoordinates }) => {
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

  // Sending updated coordinates to the server
  const handleSendCoordinates = async () => {
    setLoading(true);

    // if user is logged in and has a rider id, send the updated coordinates to the server
    if (!riderId) {
        updateRiderData({
          pickup_coordinates: markerPosition,
          dropoff_coordinates: destinationCoordinates,
        })
        console.log('Pickup Coordinates Updated.');
        setLoading(false);
        return
    }
    else {
        try {
            const message = {
              action: 'riderLocationUpdate',
              rider_id: riderId,
              pickup_address: address,
              pickup_coordinates: markerPosition,
              dropoff_address: destination,
              dropoff_coordinates: destinationCoordinates,
            };
      
            socket.send(JSON.stringify(message));
            console.log('Rider location update sent to server:', message);
      
            updateRiderData({
              pickup_coordinates: markerPosition,
              dropoff_coordinates: destinationCoordinates,
            })
            
          } catch (error) {
            console.error('Error sending coordinates:', error);
          } finally {
            setLoading(false);
          }
    }
  };

//   // Sending updated coordinates to the server
//   const handleSendCoordinates = async () => {
//     setLoading(true);
//     try {
//       const message = {
//         action: 'riderPickupCoordinateUpdate',
//         coordinates: markerPosition,
//       };

//       socket.send(JSON.stringify(message));

//       updateRiderData({
//         pickupCoordinates: markerPosition,
//       })
      
//       console.log('Rider location updated:', message);
//     } catch (error) {
//       console.error('Error sending coordinates:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  const lightMode = [
    {
      featureType: 'water',
      stylers: [{ color: '#b9d3c2' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'landscape',
      stylers: [{ color: '#f2f2f2' }],
    },
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
  ];
  const darkMode = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#212121' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#393939' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8a8a8a' }],
    },
    {
      featureType: 'water',
      stylers: [{ color: '#000000' }],
    },
    {
      featureType: 'landscape',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
  ];
  if (!isLoaded) return <div>Loading map...</div>;
  const isDark = true;
  return (
    <>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: '100%', height: '40rem' }}
        options={{ styles: isDark ? darkMode : lightMode }}
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
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Confirm Pickup Location'}
      </button>
    </>
  );
};

export default MapWithMarker;
