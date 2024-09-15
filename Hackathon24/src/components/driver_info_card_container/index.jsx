import React, { useEffect, useState} from "react";
import DriverInfoCard from "../driver_info_card";

import './index.css'

const DriverInfoCardContainer = () => {
    const [drivers, setDrivers] = useState([]);

    const mockDrivers = [
        { id: 1, name: "John Doe", queue_length: 5, phone: "123-456-7890" },
        { id: 2, name: "Jane Smith", queue_length: 3, phone: "987-654-3210" },
        { id: 3, name: "Alice Johnson", queue_length: 7, phone: "555-555-5555" }
    ];


    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await fetch('http://localhost:5433/api/drivers');
                const data = await response.json();
                setDrivers(data);
            } catch (error) {
                console.error('Error fetching drivers:', error);
                setDrivers(mockDrivers); // setting drivers to mock drivers to test functionality
            }
        };

        fetchDrivers();
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
                        phone={driver.phone}
                    />
                ))
            )}
        </div>
    );
};

export default DriverInfoCardContainer;