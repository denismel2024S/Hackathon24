import { useState, useEffect } from 'react'; // Ensure useRef is included
import {PageRider} from '../PageRider'
import {Reset} from '../Reset'

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
            <div>
                {rider ? (
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
                    <p className = "fieldLabel">Pickup Location:</p>
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
                    <p className = "fieldLabel" >Dropoff Location:</p>
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
            <Reset/>
        </div>
    );
    
}