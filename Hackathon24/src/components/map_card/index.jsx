import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Ensure the Leaflet icon files are available
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';

const MapClickHandler = ({ setLatLng }) => {
  useMapEvents({
    click(e) {
      setLatLng(e.latlng);
    },
  });

  return null;
};

const MapCard = () => {
  const [latLng, setLatLng] = useState(null);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler setLatLng={setLatLng} />
        {latLng && (
          <Marker position={latLng}>
            <Popup>
              You clicked here: <br />
              Latitude: {latLng.lat} <br />
              Longitude: {latLng.lng}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapCard;
