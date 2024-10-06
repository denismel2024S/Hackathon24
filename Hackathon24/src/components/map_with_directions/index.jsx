import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import './index.css'

const MapWithDirections = ({ pickupLocation, destination }) => {
  const mapRef = useRef(null);  // Create a ref to store the map instance

  useEffect(() => {
    if (!pickupLocation) {
      console.error('Invalid location data: pickupLocation is missing');
      return;
    }
    
    if (!destination) {
      console.error('Invalid location data: destination is missing');
      return;
    }
    
    if (!pickupLocation.lat) {
      console.error('Invalid location data: pickupLocation latitude is missing or malformed');
      return;
    }
    
    if (!pickupLocation.lng) {
      console.error('Invalid location data: pickupLocation longitude is missing or malformed');
      return;
    }
    
    if (!destination.lat) {
      console.error('Invalid location data: destination latitude is missing or malformed');
      return;
    }
    
    if (!destination.lng) {
      console.error('Invalid location data: destination longitude is missing or malformed');
      return;
    }
    

    // Check if the map has already been initialized to prevent re-initialization
    if (mapRef.current) {
      mapRef.current.remove();  // Remove the map before re-initializing
    }

    // Initialize the map
    const map = L.map('map').setView([pickupLocation.lat, pickupLocation.lng], 13);
    mapRef.current = map;  // Store the map instance in the ref

    // Add a tile layer (you can use other tile providers)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add route between pickup and destination
    L.Routing.control({
      waypoints: [
        L.latLng(pickupLocation.lat, pickupLocation.lng), // Pickup location
        L.latLng(destination.lat, destination.lng)        // Destination
      ],
      lineOptions: {
        styles: [{ color: '#6FA1EC', weight: 4 }]        // Customize the route line style
      }
       // Disable default markers if you have custom icons
    }).addTo(map);

    // Clean up the map instance when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickupLocation, destination]);

  return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
};

export default MapWithDirections;
