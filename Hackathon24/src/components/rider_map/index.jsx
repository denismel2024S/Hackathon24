import React, {useState} from "react";
import './index.css'

import MapWithDirections from "../map_with_directions";

const pickupLocation = { lat: 37.22404604170506, lng: -80.418091260216 };
    const destination = { lat: 37.24309222144794, lng:  -80.42563313338609 };

const RiderMap = ( {account, driver, pickupLocation, destination}) => {
    console.log(pickupLocation)
    console.log(destination)
    const first = { lat, lng};
    const second= {lat, lng};
    first.lat = pickupLocation.x;
    first.lng = pickupLocation.y;
    second.lat = destination.x;
    second.lng = destination.y;

    const pickupLocationCoordinates = { lat: pickupLocation.x, lng: pickupLocation.y};

    const destinationCoordinates = { lat: destination.x, lng: destination.y};
    console.log(pickupLocationCoordinates);
    console.log(destinationCoordinates)

    const [passenger, setPassenger] = useState(null);

    return(
        <div className="rider_map">
            <MapWithDirections pickupLocation={first} destination={second} />
        </div>
    )
}

export default RiderMap;