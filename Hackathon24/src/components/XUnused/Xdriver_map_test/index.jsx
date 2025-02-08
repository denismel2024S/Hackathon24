import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const DriverMapTest = ({ coordinates }) => {
  const [center, setCenter] = useState(coordinates);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc", // Replace with your API key
  });

  useEffect(() => {
    if (coordinates) {
      setCenter(coordinates);
    }
  }, [coordinates]);

  
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
    <GoogleMap
      center={center}
      zoom={15}
      mapContainerStyle={{ width: "100%", height: "20rem", borderRadius: '10px' }}
      options={{ styles: isDark ? darkMode : lightMode }}
    >
    {center && <Marker position={center} />}
    </GoogleMap>
  );
};

export default DriverMapTest;
