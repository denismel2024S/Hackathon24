import React, { useEffect, useState} from "react";
import DriverInfoCard from "../DriverInfoCard";

function DriverInfoCardContainer({ inQueue, setInQueue, connectedUsers, socket, riderId, rider, setRider, updateRiderData }) {
    const[drivers, setDrivers] = useState([]);

    useEffect(() => {
        setDrivers(connectedUsers);
    }, [connectedUsers]);
    
    useEffect(() => {
        console.log(drivers.length);
        console.log("Drivers updated");
    }, [drivers]);
    
    useEffect(() => {
        setRider(rider);
    }, [rider]);

    const addToQueue = (index) => {
        setDrivers((prevDrivers) => {
            const updatedDrivers = [...prevDrivers];
            updatedDrivers[index].queue = Number(updatedDrivers[index].queue);
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
                    
                    <>
                    <DriverInfoCard 
                        driver={user}
                        key={index}
                        socket={socket}
                        onAddQueue={() => addToQueue(index)}
                        rider={rider}
                        setRider={setRider}
                        riderId={riderId}
                        driverId={user.id}
                        inQueue={inQueue}
                        setInQueue={setInQueue}
                        updateRiderData={updateRiderData}
                    />
                    </>
                ))
            )}
        </div>
    );
};

export default DriverInfoCardContainer;