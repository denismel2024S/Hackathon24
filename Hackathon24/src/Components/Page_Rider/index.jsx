import React from "react";

import DriverInfoCardContainer from "../driver_info_card_container";
import UserInfoCard from "../user_info_card";
import MapCard from "../map_card";

const RiderPage = () => {
    return(
        <div classname="container">
            <DriverInfoCardContainer></DriverInfoCardContainer>
            <UserInfoCard></UserInfoCard>
            <MapCard></MapCard>
        </div>
    )
}

export default RiderPage;