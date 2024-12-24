import {useState} from 'react'
import {PageDriver} from '../Page_Driver'

export function DriverLogin({onSubmit}){
    const[submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
      });
    
      const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value}));
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Driver Information:', formData);
        setSubmitted(true)
        //process form data
      };
    console.log("In the DriverLogin")
    if(submitted){
        return <PageDriver formData = {formData}/>
    }
    return (
        <div>
            <h1>Driver Information</h1>
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
                <button type="submit">Submit</button>
            </form>
        </div>
    );
    
}