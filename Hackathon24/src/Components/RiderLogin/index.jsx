import {useState} from 'react'

export function Login({onSubmit}){
    const [formData, setFormData] = useState({
        name: '',
        passengers: '',
        phone: '',
        location: '',
    
      });
    
      const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value}));
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Rider Information:', formData);
        alert('Ride request submitted');
        //process form data
        //add it to driver
      };
    return (
        <div>
            <h1>Rider Information</h1>
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
                    Number of Passengers:
                    <input
                        type="number"
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                </label>
                <br />
                <label>
                    Phone Number:
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}" 
                    />
                </label>
                <br />
                <label>
                    Current Location:
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
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