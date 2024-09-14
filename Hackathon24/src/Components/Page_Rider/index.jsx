import React from "react";

import DriverInfoCardContainer from "../driver_info_card_container";
import CurrentQueueDriverInfoCard from "../current_queue_driver_info_card";
import MapCard from "../map_card";

const PageRider = () => {
    return(
        <div classname="container">
            <DriverInfoCardContainer></DriverInfoCardContainer>
            <CurrentQueueDriverInfoCard
            name={driver.name}
            queue_position={driver.queue_position}
            phone={driver.phone}
            />
            <MapCard></MapCard>
        </div>
    );
};

export default PageRider;