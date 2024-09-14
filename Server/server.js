//Boiler Plate
const express = require('express')
const cors = require('cors')
const pool = require('./database')
const bodyParser = require('body-parser');

const app = express()
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json())
app.use(cors()) //if client and server are at different urls
const port = 5432;

// Route to fetch active drivers
app.get("/api/drivers", async (req, res) => {
    try {
      // Query to get drivers who are active
      const result = await pool.query("SELECT * FROM drivers WHERE is_active = TRUE");
      res.json(result.rows);  // Send active drivers to frontend
    } catch (error) {
      console.error("Error fetching active drivers:", error);
      res.status(500).send("Server error");
    }
  });

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
