//Boiler Plate


const express = require('express')
const sqlite3 = require("sqlite3").verbose();
const cors = require('cors')
const pool = require('./database')
const bodyParser = require('body-parser');

const app = express()
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json())
app.use(cors()) //if client and server are at different urls

const db = new sqlite3.Database("./app.db", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Database opened successfully");
  }
});

// Route to fetch active drivers
app.get("/api/active_drivers", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM drivers WHERE is_driving = true AND queue_length > 0');
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching active drivers:", error);
      res.status(500).send("Server error");
    }
      // Send the product data as JSON
  });


app.get("/api/rider/by-phone/:phone", (req, res) => {
  const { phone } = req.params;
  console.log("Phone number received:", phone); // Debugging the phone number
  const query = `SELECT * FROM riders WHERE phone_number = ?`;

  console.log("Executing query:", query, "with params:", [phone]); // Debugging the query

  db.get(query, [phone], (err, row) => {
    if (err) {
      console.error("Error fetching rider by phone", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (row) {
      res.setHeader("Content-Type", "application/json"); // Set content type to JSON
      res.json(row);
    } else {
      res.status(404).json({ message: "Rider with phone not found" });
      console.log("failed getting rider with phone number", phone);
    }
  });
});


app.get("/api/driver/by-phone/:phone", (req, res) => {
  const { phone } = req.params;
  console.log("Phone number received:", phone); // Debugging the phone number
  const query = `SELECT * FROM drivers WHERE phone_number = ?`;

  console.log("Executing query:", query, "with params:", [phone]); // Debugging the query

  db.get(query, [phone], (err, row) => {
    if (err) {
      console.error("Error fetching rider by phone", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (row) {
      res.setHeader("Content-Type", "application/json"); // Set content type to JSON
      res.json(row);
    } else {
      res.status(404).json({ message: "Driver with phone not found" });
      console.log("failed getting rider with phone number", phone);
    }
  });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body; // Expect username and password in the request body

    try {
      // Assuming you have a 'users' table with 'username', 'password', and 'role' columns
      const query = 'SELECT * FROM accounts WHERE username = $1 AND password = $2';
      const result = await pool.query(query, [username, password]);

      if (result.rows.length > 0) {
          const account = result.rows[0];
          res.json({ success: true, role: account.role, id: account.user_id, currentLocation_x: account.currentLocation.x, destination: account.destination }); // Send back role of user
      } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/join-queue/:riderId/:driverId', async (req, res) => {
    const { riderId, driverId } = req.params;
    try {
        // Logic to add the rider to the queue with the specified driver
        // For example, you could insert a new record in the queue table
        const result = await pool.query(
            'INSERT INTO queue (rider_id, driver_id, status) VALUES ($1, $2, $3)',
            [riderId, driverId, 'active']
        );
        
        res.json({ message: 'Successfully joined the queue!' });
    } catch (error) {
        console.error('Error joining the queue:', error);
        res.status(500).json({ message: 'Failed to join the queue' });
    }
  });

app.post('/api/leave-queue/:riderId', async (req, res) => {
  const { riderId } = req.params;
  try {
      // Logic to add the rider to the queue with the specified driver
      // For example, you could insert a new record in the queue table
      const result = await pool.query(
          'UPDATE queue SET status = $1 WHERE rider_id = $2 AND status = $3',
          ['canceled', riderId, 'active']
      );
      
      res.json({ message: 'Successfully left the queue!' });
  } catch (error) {
      console.error('Error joining the queue:', error);
      res.status(500).json({ message: 'Failed to join the queue' });
  }
});


  app.get('/queue/rider/:rider_id', async (req, res) => {
    const riderId = req.params.rider_id;

    try{
      const result = await pool.query(
        'SELECT * FROM queue WHERE rider_id = $1 AND status = $2',
        [riderId, 'active']
      );
      //check if the number of active queue's is greater than 0
      // Check if a driver with the given ID exists
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Queue not found for rider' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  



  app.get('/driver/:driver_id', async (req, res) => {
    const driverId = req.params.driver_id;
  
    try {
      // Query to get driver information from the database
      const result = await pool.query(
        'SELECT * FROM drivers WHERE id = $1',
        [driverId]
      );
  
      // Check if a driver with the given ID exists
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Driver not found' });
      }
  
      // Send the driver data as a response
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.listen(5433, () => {
  console.log("Server is listening on port " + 5433);
});
