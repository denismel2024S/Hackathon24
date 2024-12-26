import React, { useEffect, useState} from "react";
import DriverInfoCard from "../driver_info_card";

import './index.css'

function DriverInfoCardContainer({ connectedUsers }) {
    const[drivers, setDrivers] = useState([]);

    useEffect(() => {
        setDrivers(connectedUsers);
        console.log(drivers.length);
        console.log("Drivers updated");
    }, [connectedUsers]);

    const addToQueuue = (index) => {
        setDrivers((prevDrivers) => {
            const updatedDrivers = [...prevDrivers];
            updatedDrivers[index].queue = Number(updatedDrivers[index].queue) + 1;
            return updatedDrivers;
        });
        console.log("Add to queue clicked");
    };


    return (
        <div class="drivers-container">
            {drivers.length === 0 ? (
                <p>No active drivers</p>
            ) : (
                drivers.map((user, index) => (
                    <li key = {index}>
                        <p>Name: {user.username}</p>
                        <p>Phone Number: {user.phoneNumber}</p>
                        <p>Current Queue: {user.queue}</p>
                        <button onClick = {() => addToQueuue(index)}>Add to queue</button>
                    </li>
                ))
            )}
        </div>
    );
};

export default DriverInfoCardContainer;