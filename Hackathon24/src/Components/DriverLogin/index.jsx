import {useState, useEffect} from 'react'
import {PageDriver} from '../PageDriver'
import axios from 'axios';
import {Reset} from '../Reset'

function formatToPhone(input){
    // Find all digits in the input string using a regular expression
    const phone = input.replace(/\D/g, ''); // Remove all non-digit characters
  
    // Check if there are exactly 10 digits
    if (phone.length === 10) {
      // Format the number as (xxx) - xxx - xxxx
      return `(${phone.slice(0, 3)}) - ${phone.slice(3, 6)} - ${phone.slice(6)}`;
    } 
}

export function DriverLogin({}){
    const[submitted, setSubmitted] = useState(false)

    const [driver, setDriver] = useState({
        id: null,
        username: '',
        phone_number: '',
        queue_length: 0,
        car_type: '',
        shift: "",
    });

    const [formData, setFormData] = useState({  
        name: '',
        phone: '',
        car_type: '',
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
        
        /*const validCapacity = Number(formData.capacity);
        if (isNaN(validCapacity)) {
            console.error("Invalid capacity input:", formData.capacity);
            return;
        }*/

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
        const submitted = localStorage.getItem('submitted') === "true";
        if (cachedDriver) {
            const parsedDriver = JSON.parse(cachedDriver);
            setDriver(parsedDriver);
        }
        setSubmitted(submitted);
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
            <>
                {driver  ? (
                        <PageDriver 
                        formData = {formData} 
                        driver={driver} 
                        setDriver={setDriver}
                        updateDriverData={updateDriverData}
                        />
                ) : (
                    <div>Loading....</div>
                )}
            </>
            
            )
    }
    return (
        <div className ="driverInput">
            <div className="header">
                <i className="fa-solid fa-user idLogo"></i>
                <h1 className = "pageTitle">Driver Information</h1>
            </div>
            <form className = "inputsContainer" onSubmit={handleSubmit}>
                <label>
                    <p className = "fieldLabel">Name</p>
                    <div className = "inputGroup">
                        <input
                            className = "input"
                            type="text"
                            name="name"
                            value={(formData.name)}
                            onChange={handleChange}
                            placeholder='Chris Consigli...'
                            required
                        />
                        <span className = "highlight"></span>
                        <span className = "bar"></span>
                    </div>
                </label>
                <br />
                <label>
                    <p className = "fieldLabel">Phone Number </p> 
                    <div className = "inputGroup">

                        <input
                            className = "input"
                            type="tel"
                            name="phone"
                            // value={formatToPhone(formData.phone)}
                            value={(formData.phone)}
                            onChange={handleChange}
                            placeholder='(123)-456-7890...'
                            // required
                            // pattern="[0-9]{10}" 
                        />
                        <span className = "highlight"></span>
                        <span className = "bar"></span>
                    </div>
                </label>
                <br></br>
                <label>
                    <p className = "fieldLabel">Car Type: </p> 
                    <div className = "inputGroup">

                        <input
                            className = "input"
                            type="text"
                            name="car_type"
                            value={(formData.car_type)}
                            onChange={handleChange}
                            placeholder='blue toyota truck'
                        />
                        <span className = "highlight"></span>
                        <span className = "bar"></span>
                    </div>
                </label>
                <br />
                <button className = "submit" type="submit">Submit</button>
            </form>
            <Reset/>
        </div>
    );
    
}