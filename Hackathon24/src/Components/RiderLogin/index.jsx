import { useState, useEffect } from 'react'; // Ensure useRef is included
import {PageRider} from '../PageRider'
import {Reset} from '../Reset'
import PlacesAutocomplete from 'react-places-autocomplete';
import { pick, set } from 'lodash';

export function RiderLogin({onSubmit}){
    const[submitted, setSubmitted] = useState(false)
    const [location, setLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [driver, setDriver] = useState(null); // Start as null for better checks
    
    const [rider, setRider] = useState({
        id: null,
        username: '',
        phone_number: '',
        pickup_location: '',
        dropoff_location: '',
        numRiders: 0,  
        driver_id: null,
    });

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pickup: '',
        dropoff: '',
        riders: '',
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

        let dropoff_coordinates = null;
        try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address
              )}&key=AIzaSyClpAbZE9jOntj_O-zuSrujl4F6d_Om_Yc` // Replace with your API key
            );
            const location = response.data.results[0].geometry.location;
            dropoff_coordinates = location;
          } catch (error) {
            console.error('Error geocoding address:', error);
          }
    
        // Prepare form data for the rider
        const formRiderData = {
            id: rider.id || null,
            username: formData.name || rider.username,
            phone_number: formData.phone || rider.phone_number,
            pickup_location: formData.pickup || rider.pickup_location,
            dropoff_location: formData.dropoff || rider.dropoff_location,
            numRiders: formData.riders || rider.numRiders,
            driver_id: rider.driver_id || null,
            pickup_coordinates: null,
            dropoff_coordinates: dropoff_coordinates,
        };
    
        // Update rider state
        setRider(formRiderData);
    
        // Log updated state using useEffect
        console.log('Submitting form with rider data:', formRiderData);
    
    };
    
        
    useEffect(() => {
        const rider = window.localStorage.getItem('rider');
        // const driver = window.localStorage.getItem('driver');
        const submitted = window.localStorage.getItem('submitted');
        if (rider) {
            setRider(JSON.parse(rider));
        }
        // if (driver){
        //     setDriver(JSON.parse(driver));
        // }
    }, []);


    useEffect(() => {
            if (rider.id !== null) {
                console.log('Rider logged in', rider);
                setSubmitted(true);
            }
            window.localStorage.setItem('rider', JSON.stringify(rider));
            window.localStorage.setItem('submitted', submitted);
        }, [rider]); // This will log when user submits form data


    console.log("In the RiderLogin")
    if(submitted){
        return(
            <>
                {rider ? (
                    <PageRider 
                        formData = {formData} 
                        rider={rider} 
                        setRider={setRider}
                        driver={driver}
                        setDriver={setDriver}
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
            <div className="header">
                <i className="fa-solid fa-user idLogo"></i>
                <h1 className = "pageTitle">Rider Information</h1>
            </div>
            <form className = "inputsContainer" onSubmit={handleSubmit}>
                <label>
                    <p className = "fieldLabel">Name</p>
                    <div className="inputGroup">
                        <input
                            className = "input"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='Ella Jane...'
                            required
                        />
                        <span className = "highlight"></span>
                        <span className = "bar"></span>
                    </div>
                </label>
                <label>
                    <p className = "fieldLabel">Phone Number</p>
                    <div className="inputGroup">
                        <input
                            //type="tel"
                            className = "input"
                            type="number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}" 
                            placeholder="(123)-456-7890"
                        />
                        <span className = "highlight"></span>
                        <span className = "bar"></span>
                    </div>
                </label>
                
                <label>
                    <p className="fieldLabel">Pickup</p>
                    <PlacesAutocomplete
                    value={formData.pickup}
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
                        value={formData.dropoff}
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
                <label>
                <p className = "fieldLabel">Rider(s)</p>
                    <div className="inputGroup">
                        <input
                            //type="tel"
                            className = "input"
                            type="number"
                            name="riders"
                            value={formData.riders}
                            onChange={handleChange}
                            required
                            placeholder="1"
                        />
                        <span className = "highlight"></span>
                        <span className = "bar"></span>
                    </div>
                </label>
                <button className = "submit" type="submit">Submit</button>
            </form>
            <Reset/>
        </div>
    );
    
}