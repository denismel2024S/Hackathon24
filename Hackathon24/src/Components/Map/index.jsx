import React from "react";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import { useState } from 'react';


const Map = () => {
    const [user, setUser] = useState({
        pickup: '',
        destination: '',
      });
    
    const handleLocationSubmit = ({ pickup, destination }) => {
        // Here you can handle the form data, e.g., saving it to state or sending it to a backend
        setUser({ pickup, destination });
        console.log('Updated User:', { pickup, destination }); // For debugging purposes
      };
    
      return (
        <div>
          <MapCard/>
          <h1>User Location Form</h1>
          <LocationForm onSubmit={handleLocationSubmit} />
          <div>
            <h2>Current User Locations</h2>
            <p>Pickup: {user.pickup}</p>
            <p>Destination: {user.destination}</p>
          </div>
        </div>
      );
};

export default Map;