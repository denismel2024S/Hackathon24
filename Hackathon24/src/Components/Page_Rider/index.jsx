import React, { useState, useEffect } from "react";
import DriverInfoCardContainer from "../driver_info_card_container";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import RiderMap from "../rider_map";

const Page_Rider = () => {
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
};
export default Page_Rider;
//const PageRider = ({ account }) => {
  //const [driver, setDriver] = useState(null);
  //const [user, setUser] = useState({
    //pickup: '',
    //destination: '',
  //});


  //const pickupLocation = { lat: 37.22404604170506, lng: -80.418091260216 };
  //const destination = { lat: 37.22404604170506, lng: -80.418091260216 };
  //destination.lng = account.currentLocation_x;
  //destination.lat = account.currentLocation_y;
  

  //useEffect(() => {
    //const checkQueueStatus = async () => {
      //const riderId = account.id;
      //try { // fetching any queue with a rider_id that matches the account_id
        //const queueResponse = await fetch(`http://localhost:5433/queue/rider/${riderId}`);
        //if (queueResponse.ok) {
          //const queueData = await queueResponse.json();
          //const queueDriverId = queueData.driver_id;
          //// fetching a driver with a id that matches the queue's driver_id
          //const driverResponse = await fetch(`http://localhost:5433/driver/${queueDriverId}`)
          //// setInQueue(queueData.inQueue); // Assuming the response has a field 'inQueue'
          //if (driverResponse.ok){
            //const driverData = await driverResponse.json();
            //pickupLocation.lat = driverData.currentLocation_y;
            //pickupLocation.lng = driverData.currentLocation_x;
            //setDriver(driverData);
          //}
        //} else {
          //console.error("Failed to fetch queue status:", response.statusText);
        //}
      //} catch (error) {
        //console.error("Error fetching queue status:", error);
      //}
    //};
    //checkQueueStatus();
  //}, [account.user_id])



  //// useEffect(() => {
  ////   // Fetch driver data based on the current user's driver queue or ID
  ////   const fetchDriverData = async () => {
  ////     try {
  ////       const response = await fetch(`http://localhost:5433/driver/${account.driver_id}`);
  ////       if (response.ok) {
  ////         const driverData = await response.json();
  ////         setDriver(driverData);
  ////       } else {
  ////         console.error("Failed to fetch driver data:", response.statusText);
  ////       }
  ////     } catch (error) {
  ////       console.error("Error fetching driver data:", error);
  ////     }
  ////   };

  ////   if (account.driver_id) {
  ////     fetchDriverData();
  ////   }
  //// }, [account.driver_id]);

  //const handleLocationSubmit = ({ pickup, destination }) => {
    //setUser({ pickup, destination });
    //console.log('Updated User:', { pickup, destination });
  //};


  //return (
    //<div className="container">
      //{driver === null ? (
        //<DriverInfoCardContainer 
        //account={account}/>

      //) : (
        //driver && (
          //<CurrentQueueDriverInfoCard
            //name={driver.name}
            //queue_position={driver.queue_length}
            //phone={driver.phone_number}
            //account={account}   
          //>
            //<RiderMap 
            //account={account}
            //driver={driver}
            //destination={destination}
            //pickupLocation={pickupLocation}
            ///>
            

          //</CurrentQueueDriverInfoCard>
        //)
      //)}

      

      

      //<LocationForm onSubmit={handleLocationSubmit} />

      //<div>
        //<h2>Current User Locations</h2>
        //<p>Pickup: {user.pickup}</p>
        //<p>Destination: {user.destination}</p>
      //</div>
    //</div>
  //);
//};

//export default PageRider;
