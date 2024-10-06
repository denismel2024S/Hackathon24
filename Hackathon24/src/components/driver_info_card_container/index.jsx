import React, { useEffect, useState} from "react";
import DriverInfoCard from "../driver_info_card";

import './index.css'

function DriverInfoCardContainer({ account }) {
    // const [drivers, setDrivers] = useState([
    //     { id: 1, name: "John Doe", queue_length: 5, phone: "123-456-7890" },
    // ]);
    const[drivers, setDrivers] = useState([]);

    // useEffect(() => {
    //     const fetchDrivers = async () => {
    //         try {
    //             //const response = await fetch('http://localhost:5173/api/drivers');
    //             //const data = await response.json();
    //             //setDrivers(data);
    //             fetch('http://localhost:5433/products') // Ensure this matches your Express server's URL
    //             .then(response => response.json())
    //             .then(data => setDrivers(data))
    //         } catch (error) {
    //             console.error('Error fetching drivers:', error);
    //             setDrivers([]); // setting it to empty if there are no drivers
    //         }
    //     };

    //     fetchDrivers();
    // }, []);

    useEffect(() => {
        try {
            //const response = await fetch('http://localhost:5173/api/drivers');
            //const data = await response.json();
            //setDrivers(data);
            fetch('http://localhost:5433/api/active_drivers') // Ensure this matches your Express server's URL
            .then(response => response.json())
            .then(data => setDrivers(data))
        } catch (error) {
            console.error('Error fetching drivers:', error);
            setDrivers([]); // setting it to empty if there are no drivers
        }
    }, []);


    return (
        <div className="drivers-container">
            {drivers.length === 0 ? (
                <p>No active drivers</p>
            ) : (
                drivers.map((driver) => (
                    <DriverInfoCard
                        key={driver.id}
                        name={driver.name}
                        queueLength={driver.queue_length}
                        phone={driver.phone_number}
                        account={account}
                        driverId={driver.id}
                    />
                ))
            )}
        </div>
    );
};

export default DriverInfoCardContainer;