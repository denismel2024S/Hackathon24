import React, { useState, useEffect } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import axios from 'axios';
import MapWithMarker from '../xmap_with_marker';
import throttle from 'lodash/throttle';


const LocationChangeForm = ({ riderId, socket,  updateRiderData }) => {
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressesConfirmed, setAddressesConfirmed] = useState(false); // New state to toggle views
  const [changeLocation, setChangeLocation] = useState(false);
  const [showingConfirmation, setShowingConfirmation] = useState(false);

  const [chngLocStep, setChngLocStep] = useState(1);

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    updateRiderData({
      pickup_location: newLocation, // Rider is leaving the queue, so we reset driver_id
    });

  };

  const handleDestinationChange = (newDestination) => {
    setDestination(newDestination);
    updateRiderData({
      dropoff_location: newDestination,
    });

  };

  const handleLocationSelect = async (address) => {
    setLocation(address);
    updateRiderData({
      pickup_location: address, // Rider is leaving the queue, so we reset driver_id
    });
    setLoading(true);

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: 'AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc', // Replace with your API key
          },
        }
      );

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setPickupCoordinates(response.data.results[0].geometry.location); // Set coordinates for the map
        updateRiderData({
          pickup_coordinates: { lat, lng }, // Rider is leaving the queue, so we reset driver_id
        });
      } else {
        console.error('No results found for the selected address.');
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationSelect = async (address) => {
    setDestination(address);
    setLoading(true);

    updateRiderData({
      dropoff_location: address,
    });

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: 'AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc', // Replace with your API key
          },
        }
      );

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setDestinationCoordinates({ lat, lng }); // Store destination coordinates
        updateRiderData({
          dropoff_coordinates: response.data.results[0].geometry.location,
        });
      } else {
        console.error('No results found for the selected address.');
      }
    } catch (error) {
      console.error('Error during geocoding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddresses = (e) => {
    e.preventDefault();
    if (!pickupCoordinates || !destinationCoordinates) {
      alert('Please set both pickup and destination locations before confirming.');
      return;
    }
    // const throttledSendLocationUpdate = throttle(
    //   (socket, riderId, pickupCoordinates, location, destination) => {
    //     try {
    //       const message = {
    //         rider_id: riderId,
    //         pickup_coordinates: pickupCoordinates,
    //         pickup_location: location,
    //         dropoff_location: destination,
    //         action: 'riderLocationUpdate',
    //       };

    //       socket.send(JSON.stringify(message));
    //       console.log('Rider location updated:', message);
    //     } catch (error) {
    //       console.error('Error sending location update:', error);
    //     }
    //   },
    //   2000, // Adjust the throttle duration (in milliseconds) as needed
    //   { leading: true, trailing: false } // Send immediately on the first call, and ignore trailing events
    // );

    // // Use the throttled function (you may need to pass relevant arguments here)
    // throttledSendLocationUpdate(socket, riderId, pickupCoordinates, location, destination);

    alert('New Locations set');
    setChangeLocation(false);
    setAddressesConfirmed(true); // Toggle to map view
  };
  const resetChngLocation = () => {
    setChngLocStep(1);
  }

  return (
    <div className = "locationForm">
      {chngLocStep === 1 && (
        <button onClick = {() => setChngLocStep(chngLocStep+1)}>Change Location</button>
      )}


      {chngLocStep === 2 && (
        <>
        <form>
          <div>
            <label>
                    <p className="fieldLabel">Pickup</p>
                    <PlacesAutocomplete
                    value={location}
                    name="pickup"
                    onChange={handleLocationChange}
                    onSelect={handleLocationSelect}
                    required
                    >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div className = "inputGroup">
                        <input
                            {...getInputProps({ placeholder: 'Bennys...' })}
                            required
                            className = "input"
                        />
                            <span className = "highlight"></span>
                            <span className = "bar"></span>
                        <div className = "suggestionDiv">
                            {loading && <div>Loading...</div>}
                            {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                {...getSuggestionItemProps(suggestion, {
                                className: 'suggestion-item',
                                style: {
                                    backgroundColor: suggestion.active ? '#d3d3d3' : '#272727',
                                    cursor: 'pointer',
                                },
                                })}
                            >
                                {suggestion.description}
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    </PlacesAutocomplete>
                </label>
                <label>
                    <p className="fieldLabel">Destination</p>
                    <PlacesAutocomplete
                        value={destination}
                        name="dropoff"
                        onChange={handleDestinationChange}
                        onSelect={handleDestinationSelect}
                        required
                    >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div className = "inputGroup">
                            <input
                            {...getInputProps({ placeholder: 'The Retreat' })}
                            required
                            className = "input"
                            />
                            <span className = "highlight"></span>
                            <span className = "bar"></span>
                        <div className = "suggestionDiv">
                            {loading && <div>Loading...</div>}
                            {suggestions.map((suggestion, index) => (
                                <div className="">
                                    <div
                                    key={index}
                                    {...getSuggestionItemProps(suggestion, {
                                        className: 'suggestion-item',
                                        style: {
                                        cursor: 'pointer',
                                        },
                                    })}
                                    >
                                    {suggestion.description}
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </PlacesAutocomplete>
                </label>
          </div>

        </form>
        <button onClick = {() => setChngLocStep(chngLocStep+1)}>Next</button>
        </>
      )}

      {chngLocStep === 3 && (
        <>
          <MapWithMarker
              riderId={riderId}
              address={location}
              destination={destination}
              initialCoordinates={pickupCoordinates}
              onCoordinatesChange={setPickupCoordinates}
              socket={socket}
              updateRiderData={updateRiderData}
              setPickupCoordinates={setPickupCoordinates}
              destinationCoordinates={destinationCoordinates}
              showButton={(true)}
              onComplete = {resetChngLocation}
            />
        </>

      )}
    </div>
  );
};

export default LocationChangeForm;