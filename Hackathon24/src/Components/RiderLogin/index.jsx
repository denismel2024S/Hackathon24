import { useState, useEffect } from 'react'; // Ensure useRef is included
import {PageRider} from '../PageRider'

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