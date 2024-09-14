//Boiler Plate
const express = require("express")
const cors = require("cors")
const pool = require("./database")
const bodyParser = require('body-parser');

const app = express()
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json())
app.use(cors()) //if client and server are at different urls
const port = 8080;


app.listen(port, () => {console.log("Server is listening on port" + port)})
