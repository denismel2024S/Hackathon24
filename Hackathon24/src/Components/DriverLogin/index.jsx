import {useState, useEffect} from 'react'
import {PageDriver} from '../PageDriver'
import axios from 'axios';

export function DriverLogin({}){
    const[submitted, setSubmitted] = useState(false)

    const [driver, setDriver] = useState({
        id: null,
        username: '',
        phone_number: '',
        queue_length: 0,
    });

    const [formData, setFormData] = useState({  
        name: '',
        phone: '',
    });
    
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value}));
    };

    const updateDriverData = (newData) => {
        setDriver(prevState => ({
            ...prevState,
            ...newData
        }));
    };

    useEffect(() => {
        console.log('Driver state updated:', driver);
    }, [driver]);  // This will run every time the driver state changes.
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Driver Information:', formData);
        setSubmitted(true)
        //axios.defaults.baseURL = 'http://localhost:5433'; // Replace with your server's base URL if necessary
        axios.defaults.baseURL = 'http://192.168.1.45:5433'; // Replace with your server's base URL if necessary

        try {
            console.log("Retrieving driver by phone number");
    
            // Attempt to retrieve the driver by phone number
            const response = await axios.get(`/api/driver/by-phone/${formData.phone}`);
            console.log("GET request sent");
                 
            if (response.data) {
                // If driver found, update driver data state
                console.log("Driver by phone number retrieved:", response.data);
                const newDriverData = {
                    id: response.data.id,
                    username: response.data.username,
                    phone_number: response.data.phone_number,
                    queue_length: response.data.queue_length,
                };
                updateDriverData(newDriverData);
            } else {
                // This block will never be reached, as response.data should never be null
                console.log("Driver not found, creating a new driver...");
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // Driver not found, proceed to create a new driver
                console.log("Driver not found, creating a new driver...");
                const newDriverData = {
                    username: formData.name,
                    phone_number: formData.phone,
                    queue_length: 0, // default value for a new driver
                };
    
                try {
                    // Send a request to insert a new driver
                    const insertResponse = await axios.post(`/api/driver/add/`, newDriverData);
                    console.log("Driver added successfully:", insertResponse.data.id);
    
                    // Update newDriverData with the assigned id after insertion
                    newDriverData.id = insertResponse.data.id;
                    updateDriverData(newDriverData); // Update state with the new driver data
                } catch (insertError) {
                    console.error("Error inserting new driver:", insertError.response?.data || insertError);
                    if (insertError.response?.status === 409) {
                        // If a conflict occurs, log the error or handle it
                        console.log("Driver already exists with this phone number.");
                    }
                }
            } else {
                // Any other error
                console.error("Error retrieving driver:", error.response?.data || error);
            }
        }
        console.log('Driver logged in', driver)

            
    }

    useEffect(() => {
        const cachedDriver = localStorage.getItem('driver');
        const submitted = localStorage.getItem('submitted');
        if (cachedDriver) {
            const parsedDriver = JSON.parse(cachedDriver);
            setDriver(parsedDriver);
            setSubmitted(submitted);
        }
    },[]);

    useEffect(() => {
        if (driver.id !== null && submitted) {
            console.log('Driver logged in', driver);
        }
        window.localStorage.setItem('driver', JSON.stringify(driver));
        window.localStorage.setItem('submitted', submitted);
    }, [driver, submitted]); // This will log the driver when state changes and is not null
        
    console.log("In the DriverLogin")
    
    if(submitted){
        return(
            <div>
                {driver  ? (
                    <div>
                        <PageDriver formData = {formData} driver={driver} setDriver={setDriver}/>
                    </div>
                ) : (
                    <div>Loading....</div>
                )}
            </div>
            
            )
    }
    return (
        <div>
            <h1>Driver Information</h1>
            <br></br>
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
                <br></br>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
    
}