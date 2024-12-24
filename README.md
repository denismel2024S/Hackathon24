Progress Update (12/24/2024)
Backend: 
Webserver currently has minimally functional websockets. Riders can see all drivers connected and vice versa. Realtime broadcasting for user connection/disconnection is also implemented.
TODO:
1. Implement database for caching data. Hold UUID and connection JSON objects as key-value pairs. Use SQLite? Where will data be stored(local machine or cloud)?
2. Implement driver-rider queue logic. What data structure is best?

Frontend:
UI currently shows different rider and driver pages. Drivers can see all riders connected, Google Map API, and their relevant information.
Riders can see all drivers in queue.
TODO:
1. Add UI and connect to server logic for adding and removing from queue.
2. Make it look good, it looks like trash. Use Tailwind CSS? other CSS library?
3. Improve use of state async JS.

Overall:
Plan deployment. Think about scalability, reliability.
Note: Research websocket reconnection (cellular)
