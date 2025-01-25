import React, { useEffect, useState} from "react";
import DriverInfoCard from "../DriverInfoCard";
import './index.css';


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
        <>
        <div className="scrollableList">
            {drivers.length === 0 ? (
                <h2>No Active Drivers</h2>
            ) : (
                <>
                    <h1>Current Drivers:</h1>
                    {drivers.map((user, index) => (
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
                    ))}
                </>
            )}
        </div>
        
        </>
    );
};

export default DriverInfoCardContainer;