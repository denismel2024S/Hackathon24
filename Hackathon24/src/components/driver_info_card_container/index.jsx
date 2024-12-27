import React, { useEffect, useState} from "react";
import DriverInfoCard from "../driver_info_card";

import './index.css'

function DriverInfoCardContainer({ connectedUsers, socket, riderId }) {
    const[drivers, setDrivers] = useState([]);

    // useEffect(() => {
    //     setDrivers(connectedUsers);
    //     console.log(drivers.length);
    //     console.log("Drivers updated");
    // }, [connectedUsers]);

    useEffect(() => {
        setDrivers(connectedUsers);
    }, [connectedUsers]);
    
    useEffect(() => {
        console.log(drivers.length);
        console.log("Drivers updated");
    }, [drivers]);

    const addToQueuue = (index) => {
        setDrivers((prevDrivers) => {
            const updatedDrivers = [...prevDrivers];
            updatedDrivers[index].queue = Number(updatedDrivers[index].queue) + 1;
            return updatedDrivers;
        });
        console.log("Add to queue clicked");
    };


    return (
        <div className="drivers-container">
            {drivers.length === 0 ? (
                <p>No active drivers</p>
            ) : (
                drivers.map((user, index) => (
                    <DriverInfoCard 
                        key={index}
                        username={user.username}
                        phoneNumber={user.phoneNumber}
                        queueLength={user.queue}
                        socket={socket}
                        onAddQueue={() => addToQueuue(index)}
                        riderId={riderId}
                    />
                ))
            )}
        </div>
    );
};

export default DriverInfoCardContainer;