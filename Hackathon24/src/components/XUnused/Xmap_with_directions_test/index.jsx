import React, { useState, useEffect } from 'react';
import './index.css';

import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useLoadScript,
} from '@react-google-maps/api';
import axios from 'axios';

const MapWithDirectionsTest = ({
  pickupCoordinates,
  dropoffCoordinates,
  updatingLocation,
}) => {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load the Google Maps API on component mount
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc', // Replace with your API key
    });

  useEffect(() => {
    if (pickupCoordinates && dropoffCoordinates) {
      const fetchDirections = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/directions/json`,
            {
              params: {
                origin: `${pickupCoordinates.lat},${pickupCoordinates.lng}`,
                destination: `${dropoffCoordinates.lat},${dropoffCoordinates.lng}`,
                key: googleMapsApiKey,
              },
            }
          );

          if (response.data.status === "OK") {
            setDirectionsResponse(response.data.routes[0]);
          } else {
            console.error("Failed to fetch directions:", response.data.error_message);
          }
        } catch (error) {
          console.error("Error fetching directions:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDirections();
    }
  }, [pickupCoordinates, dropoffCoordinates]);


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


  if (!isLoaded) return <div>Loading map...</div>;

  else if (updatingLocation === true) return <div></div>;

  return (
    <div>
      <GoogleMap
        center={pickupCoordinates || { lat: 37.2296, lng: -80.4244 }}
        options={{ styles: isDark ? darkMode : lightMode }}
        zoom={13}
        mapContainerStyle={{ width: '100%', height: '34vh', borderRadius: '6px' }}
      >
        {pickupCoordinates && <Marker position={pickupCoordinates} />}
        {dropoffCoordinates && <Marker position={dropoffCoordinates} />}
        {directionsResponse && (
          <DirectionsRenderer
            directions={{
              routes: [directionsResponse],
            }}
          />
        )}
      </GoogleMap>

      {loading && <p>Calculating route...</p>}
    </div>
  );
};

export default MapWithDirectionsTest;
