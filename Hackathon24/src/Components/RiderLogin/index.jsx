import { useState, useEffect } from 'react'; // Ensure useRef is included
import {PageRider} from '../PageRider'
import {Reset} from '../Reset'
import PlacesAutocomplete from 'react-places-autocomplete';

export function RiderLogin({onSubmit}){
    const[submitted, setSubmitted] = useState(false)
    const [location, setLocation] = useState('');
    const [destination, setDestination] = useState('');
    
    const [rider, setRider] = useState({
        id: null,
        username: '',
        phone_number: '',
        pickup_location: '',
        dropoff_location: '',
        driver_id: null,
    });

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pickup: '',
        dropoff: '',
    
      });

      const handleLocationChange = (address) => {
        setFormData((prevData) => ({ ...prevData, pickup: address }));
      };
    
      const handleLocationSelect = async (address) => {
        setFormData((prevData) => ({ ...prevData, pickup: address }));
        setRider((prevRider) => ({
          ...prevRider,
          pickup_location: address,
        }));
      };
    
      const handleDestinationChange = (address) => {
        setFormData((prevData) => ({ ...prevData, dropoff: address }));
      };
    
      const handleDestinationSelect = async (address) => {
        setFormData((prevData) => ({ ...prevData, dropoff: address }));
        setRider((prevRider) => ({
          ...prevRider,
          dropoff_location: address,
        }));
      };


    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value}));
    };

    const updateRiderData = (newData) => {
        setRider(prevState => ({
            ...prevState,
            ...newData
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Rider Information:', formData);
        setSubmitted(true);
    
        // Prepare form data for the rider
        const formRiderData = {
            id: rider.id || null,
            username: formData.name || rider.username,
            phone_number: formData.phone || rider.phone_number,
            pickup_location: formData.pickup || rider.pickup_location,
            dropoff_location: formData.dropoff || rider.dropoff_location,
            driver_id: rider.driver_id || null,
        };
    
        // Update rider state
        setRider(formRiderData);
    
        // Log updated state using useEffect
        console.log('Submitting form with rider data:', formRiderData);
    
    };
    
        
    useEffect(() => {
        const rider = window.localStorage.getItem('rider');
        const submitted = window.localStorage.getItem('submitted');
        if (rider) {
            setRider(JSON.parse(rider));
            setSubmitted(submitted);
        }
    }, []);
    useEffect(() => {
            if (rider.id !== null) {
                console.log('Rider logged in', rider);
            }
            window.localStorage.setItem('rider', JSON.stringify(rider));
            window.localStorage.setItem('submitted', submitted);
        }, [rider]); // This will log the driver when state changes and is not null


    console.log("In the RiderLogin")
    if(submitted){
        return(
            <>
                {rider ? (
                    <PageRider 
                        formData = {formData} 
                        rider={rider} 
                        setRider={setRider}
                        updateRiderData={updateRiderData}
                    />
                ) : (
                    <div>Loading....</div>
                )}
            </>
            )
        }
    return (
        <div className = "riderInput">
            <h1 className = "pageTitle">Rider Information</h1>
            <i className="fa-solid fa-user idLogo"></i>
            <form className = "inputsContainer" onSubmit={handleSubmit}>
                <label>
                    <p className = "fieldLabel">Name:</p>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    <p className = "fieldLabel">Phone Number:</p>
                    <input
                        //type="tel"
                        type="number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}" 
                    />
                </label>
                <br />
                
                <label>
                    Location (Pickup):
                    <PlacesAutocomplete
                    value={formData.pickup}
                    name="pickup"
                    onChange={handleLocationChange}
                    onSelect={handleLocationSelect}
                    required
                    >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                        <input
                            {...getInputProps({ placeholder: 'Enter a pickup location' })}
                            required
                        />
                        <div>
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
                
                <br />
                <label>
                    Destination:
                    <PlacesAutocomplete
                        value={formData.dropoff}
                        name="dropoff"
                        onChange={handleDestinationChange}
                        onSelect={handleDestinationSelect}
                        required
                    >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                            <input
                            {...getInputProps({ placeholder: 'Enter a destination' })}
                            required
                            />
                            <div>
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
                <button type="submit">Submit</button>
            </form>
            <Reset/>
        </div>
    );
    
}