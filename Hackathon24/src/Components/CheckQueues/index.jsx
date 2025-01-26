import React, { useState, useEffect, useRef} from "react";
import DriverInfoCard from "../DriverInfoCard";
import DriverInfoCardContainer from "../DriverInfoCardContainer";

const CheckQueues = ({}) => {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const socketRef = useRef(null);

    const WSURL = `ws://localhost:8080?`;

    useEffect(() => {
        socketRef.current = new WebSocket(WSURL);

        socketRef.current.onopen = () => {
            console.log('Websocket connection established from CheckQueues');
            // Request all connected drivers when the connection is established
            socketRef.current.send(JSON.stringify({ action: 'checkQueues' }));
            console.log("Sent getActiveQueues message to WS");
        };

        socketRef.current.onmessage = (e) => {
            console.log("Received new data from WS", JSON.parse(e.data));
            const parsedMessage = JSON.parse(e.data); // Parse the incoming WebSocket message
            console.log("Parsed Message:", parsedMessage); // Debug the parsed message
            if (Array.isArray(parsedMessage)) {
                console.log("parsedMessage is an array");
                setConnectedUsers(() => {
                    console.log("Amount of Connections: ", parsedMessage);
                    return parsedMessage;
                });
            }
        };

        return () => {
            socketRef.current.close();
        };
    }, []);

    return (
        <>
            <DriverInfoCardContainer
                connectedUsers={connectedUsers}
                socket={socketRef.current}
            />
        </>
    );
};

export default CheckQueues;