import {useState, useEffect} from 'react'
import {PageDriver} from '../PageDriver'

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
        
        const formDriverData = {
            id: null,
            username: formData.name,
            phone_number: formData.phone,
            queue_length: 0,
        };

        setDriver(formDriverData);
        console.log('Submitting form with driver data: ', formDriverData);
            
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
        if (driver.id !== null) {
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
                        <PageDriver 
                        formData = {formData} 
                        driver={driver} 
                        setDriver={setDriver}
                        updateDriverData={updateDriverData}
                        />
                    </div>
                ) : (
                    <div>Loading....</div>
                )}
            </div>
            
            )
    }
    return (
        <div className ="">
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