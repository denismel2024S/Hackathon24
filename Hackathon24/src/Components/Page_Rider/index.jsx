import React from "react";
import {useState} from 'react'

import DriverInfoCardContainer from "../driver_info_card_container";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";
import LocationForm from "../location_form";
import Map from "../Map";

const PageRider = () => {
    const [driver, setDrivers] = useState([])

    
    return(
        <div className="container">
            <DriverInfoCardContainer/>
            <CurrentQueueDriverInfoCard
            name={driver.name}
            queue_position={driver.queue_position}
            phone={driver.phone}
            />
            <Map/>
        </div>
    );
};

export default PageRider;