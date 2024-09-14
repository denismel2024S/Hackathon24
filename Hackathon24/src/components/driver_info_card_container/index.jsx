import React, { useEffect, useState} from "react";
import DriverInfoCard from './driver'

import './index.css'

const DriverInfoCardContainer = () => {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await fetch('http://localhost:5433/api/drivers');
                const data = await response.json();
                setDrivers(data);
            } catch (error) {
                console.error('Error fetching drivers:', error);
            }
        };

        fetchDrivers();
    }, []);


    return (
        <div classname="drivers-container">
            {drivers.map((driver) => (
                <DriverInfoCard
                    key={driver.id}
                    name={driver.name}
                    queueLength={driver.queue_length}
                    phone={driver.phone}
                />
            ))}
        </div>
    );
};

export default DriverInfoCardContainer;