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

app.post("/api/driver/add", (req, res) => {
  const { username, phone_number, queue_length } = req.body;

  if (!username || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO drivers (username, phone_number, queue_length)
    VALUES (?, ?, ?)
  `;

  db.run(
    query,
    [username, phone_number, queue_length],
    function (err) {
      if (err) {
        console.error("Error inserting new driver:", err);
        return res.status(500).json({ error: "Failed to add new driver" });
      }

      console.log("New driver added with ID:", this.lastID);
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post("/api/rider/add", (req, res) => {
  const { username, phone_number, pickup_location, dropoff_location, driver_id} = req.body;
  console.log(req.body);
  if (!username || !phone_number || !pickup_location || !dropoff_location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO riders (username, phone_number, pickup_location, dropoff_location, driver_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [username, phone_number, pickup_location, dropoff_location, driver_id],
    function (err) {
      if (err) {
        console.error("Error inserting new rider:", err);
        return res.status(500).json({ error: "Failed to add new rider" });
      }

      console.log("New rider added with ID:", this.lastID);
      res.status(201).json({ id: this.lastID });
    }
  );
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
      console.log(row);
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
      console.error("Error fetching driver by phone", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (row) {
      res.setHeader("Content-Type", "application/json"); // Set content type to JSON
      res.json(row);
    } else {
      res.status(404).json({ message: "Driver with phone not found" });
      console.log("failed getting driver with phone number", phone);
    }
  });
});



  app.get('/api/driver/by-id/:driver_id', (req, res) => {
    const { driver_id } = req.params;
    console.log("Driver id received:", driver_id); // Debugging the phone number

    const query = `SELECT * FROM drivers WHERE id = ?`;

    console.log("Executing query:", query, "with params:", [driver_id]); // Debugging the query

    db.get(query, [driver_id], (err, row) => {
      if (err) {
        console.error("Error fetching driver by id", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (row) {
        res.setHeader("Content-Type", "application/json"); // Set content type to JSON
        res.json(row);
      } else {
        res.status(404).json({ message: "Driver with id not found" });
        console.log("failed getting driver with id", driver_id);
      }
    });
  });

app.listen(5433, () => {
  console.log("Server is listening on port " + 5433);
});
