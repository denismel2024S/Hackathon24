import {useState} from 'react'
import {PageRider} from '../Page_Rider'

export function Login({onSubmit}){
    const[submitted, setSubmitted] = useState(false)
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
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Rider Information:', formData);
        setSubmitted(true)
        //process form data
      };
    console.log("In the RiderLogin")
    if(submitted){
        return <PageRider formData = {formData}/>
    }
    return (
        <div className = "design">
            <i  class="fa-solid fa-car carLogo"></i>
            <h1>Rider Information</h1>
            <h2 className = "header1"></h2>
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