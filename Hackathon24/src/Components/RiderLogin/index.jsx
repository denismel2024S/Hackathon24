import { useState, useEffect } from 'react'; // Ensure useRef is included
import {PageRider} from '../Page_Rider'
import axios from 'axios';

export function RiderLogin({onSubmit}){
    const[submitted, setSubmitted] = useState(false)
    

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


    // TEST ENV CONSTANT
    const [riderTest, setRiderTest] = useState(null);

    
    
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
    setSubmitted(true)
    axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary

        try {
            console.log("Retrieving riders by phone number")

            const response = await axios.get(`/api/rider/by-phone/${formData.phone}`);
            console.log("GET request sent")


            if (response.data){
                console.log((response.data));
                console.log("riders by phone number retrieved")

                // CURRENT TEST
                setRiderTest({
                    id: response.data.id,
                    username: response.data.username,
                    phone_number: response.data.phone_number,
                    pickup_location: response.data.pickup_location,
                    dropoff_location: response.data.dropoff_location,
                    driver_id: response.data.driver_id,
                })

                // Temporarily update driver object to form values for API call
                const newRiderData = {
                    id: null, // id will be auto-generated by the database
                    username: formData.name,
                    phone_number: formData.phone,
                    pickup_location: formData.pickup,
                    dropoff_location: formData.dropoff,
                    driver_id: null,
                };
                
                // if found, set newRiderData id and driver_id attributes
                newRiderData.id = response.data.id;
                newRiderData.driver_id = response.data.driver_id;

                updateRiderData({
                    id: response.data.id,
                    username: response.data.username,
                    phone_number: response.data.phone_number,
                    pickup_location: response.data.pickup_location,
                    dropoff_location: response.data.dropoff_location,
                    driver_id: response.data.driver_id,
                })
                // NEED TO ADD API CALL THAT UPDATES EXISTING USERS IF THEY ALREADY EXIST
                // UPDATE: USERNAME, PICKUP, & DROPOFF

                // if there is no valid person that exists, query to the websocket to create a new user

                // for now, use simple api call
            } else {
                console.log("Rider not found, creating a new driver...");

            }
            
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('Rider not found in database, creating new rider...')

                // Temporarily update driver object to form values for API call
                const newRiderData = {
                    id: null, // id will be auto-generated by the database
                    username: formData.name,
                    phone_number: formData.phone,
                    pickup_location: formData.pickup,
                    dropoff_location: formData.dropoff,
                    driver_id: null,
                };

                // CURRENT TEST 
                // UPDATE CURRENT USER WITH FORM INFO IF NOT ALREADY EXISTS IN DB
                setRiderTest({
                    id: null,
                    username: formData.name,
                    phone_number: formData.phone,
                    pickup_location: formData.pickup,
                    dropoff_location: formData.dropoff,
                    driver_id: null,
                })
    
                console.log(newRiderData);
                
                try{
                    const insertResponse = await axios.post(`/api/rider/add/`, newRiderData);
                    console.log('Rider added successfully:', insertResponse.data.id);
        
                    // set the new rider's id attribute to the response from server
                    newRiderData.id = insertResponse.data.id
                    
                    // updateRiderData(newRiderData)

                    // CURRENT TEST
                    // UPDATE CURRENT USER ID WITH INSERT RESPONSE
                    // KEEP DRIVER_ID AS NULL BECAUSE IT IS A NEW USER
                    setRiderTest({
                        id: insertResponse.data.id,
                        username: rider.username,
                        phoneNumber: rider.phone_number,
                        pickupLocation: rider.pickup_location,
                        dropoffLocation: rider.dropoff_location,
                        driver_id: null,
                    })

                    updateRiderData({
                        ...newRiderData,
                        id: insertResponse.data.id,
                    });


                } catch (insertError){
                    console.log("error inserting new rider");
                }
                // insert new rider
                
            } else {
                console.error("Error retrieving or adding driver:", error);
            }
        
        }
        console.log('Rider logged in: ', rider)
        console.log('Test Rider logged in: ', riderTest)



    }
        
    useEffect(() => {
            if (rider.id !== null) {
                console.log('Rider logged in', rider);
            }
        }, [rider]); // This will log the driver when state changes and is not null


    // TEST CHANGE
    // useEffect(() => {
    //     if (riderTest== null) {
    //         console.log('Test Rider logged in', riderTest);
    //     }
    // }, [riderTest]); // This will log the driver when state changes and is not null


    console.log("In the RiderLogin")
    if(submitted){
        return(
            <div>
                {rider && rider.id ? (
                    <div>
                        <PageRider 
                            formData = {formData} 
                            rider={rider} 
                            setRider={setRider}
                            updateRiderData={updateRiderData}
                        />
                    </div>
                ) : (
                    <div>Loading....</div>
                )}
            </div>
            )
        }
    return (
        <div className = "design">
            <h1>Rider Information</h1>
            <i class="fa-solid fa-user idLogo"></i>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
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
                    Phone Number:
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
                    Pickup Location:
                    <input
                        type="text"
                        name="pickup"
                        value={formData.pickup}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br/>
                <label>
                    Dropoff Location:
                    <input
                        type="text"
                        name="dropoff"
                        value={formData.dropoff}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
    
}