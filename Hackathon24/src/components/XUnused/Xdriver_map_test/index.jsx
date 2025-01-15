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

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      center={center}
      zoom={15}
      mapContainerStyle={{ width: "100%", height: "400px" }}
    >
      {center && <Marker position={center} />}
    </GoogleMap>
  );
};

export default DriverMapTest;
