// const { Pool } = require('pg');

// // Create a connection pool to PostgreSQL
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: "rideshare_app",
//   password: "alphasigmaphi",
//   port: 5432,
// });

// pool.connect().then(()=> console.log("connected"));

// const createQuery =  `CREATE TABLE IF NOT EXISTS accounts(
// user_id serial PRIMARY KEY,
// username VARCHAR (50 ) UNIQUE NOT NULL,
// password VARCHAR (50) UNIQUE NOT NULL);`

// pool.query(createQuery).then((res) => {
//   console.log("database created");
//   console.log(res);


// }).catch((error) => {
//   console.log(error);
// })

  
//   pool.query(`CREATE TABLE IF NOT EXISTS public.drivers(
//     name character varying COLLATE pg_catalog."default",
//     phone_number character varying COLLATE pg_catalog."default",
//     car_model character varying COLLATE pg_catalog."default",
//     car_make character varying COLLATE pg_catalog."default",
//     car_color character varying COLLATE pg_catalog."default",
//     is_driving boolean,
//     queue_length integer
//   )

//   TABLESPACE pg_default;

//   ALTER TABLE IF EXISTS public.drivers
//       OWNER to postgres;

//   GRANT ALL ON TABLE public.drivers TO postgres;`)
//   .then((res) => {
//     console.log("database created");
//     console.log(res);
  
  
//   }).catch((error) => {
//     console.log(error);
//   })


// module.exports = pool;

/*

NEW SQLite CODE!!!

*/


const sqlite3 = require('sqlite3').verbose();

// Open SQLite database (this will create the database file if it doesn't exist)
const db = new sqlite3.Database('./app.db');

// Create tables if they don't already exist
db.serialize(() => {
  // Create drivers table
  db.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      phone_number TEXT UNIQUE,
      queue_length INTEGER DEFAULT 0
    );
  `);

  // Create riders table
  db.run(`
    CREATE TABLE IF NOT EXISTS riders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      phone_number TEXT UNIQUE,
      pickup_location TEXT,
      dropoff_location TEXT,
      driver_id INTEGER,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );
  `);
});

console.log("Database and tables are ready.");

function addDriver(username, phoneNumber, queueLength = 0) {
  db.serialize(() => {
    db.get("SELECT * FROM drivers WHERE phone_number = ?", [phoneNumber], (err, row) => {
      if (err) {
        console.error("Error querying drivers table:", err);
        return;
      }

      if (row) {
        // Update only the username, leave queue_length unchanged
        const updateStmt = db.prepare("UPDATE drivers SET username = ? WHERE phone_number = ?");
        updateStmt.run(username, phoneNumber, (err) => {
          if (err) {
            console.error("Error updating driver:", err);
          } else {
            console.log(`Driver with phone number ${phoneNumber} updated.`);
          }
        });
        updateStmt.finalize();
      } else {
        // Insert a new driver
        const insertStmt = db.prepare("INSERT INTO drivers (username, phone_number, queue_length) VALUES (?, ?, ?)");
        insertStmt.run(username, phoneNumber, queueLength, function (err) {
          if (err) {
            console.error("Error inserting driver:", err);
          } else {
            console.log(`Driver added with ID ${this.lastID}`);
          }
        });
        insertStmt.finalize();
      }
    });
  });
}


function addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId = null) {
  db.serialize(() => {
    db.get("SELECT * FROM riders WHERE phone_number = ?", [phoneNumber], (err, row) => {
      if (err) {
        console.error("Error querying riders table:", err);
        return;
      }

      if (row) {
        // Update existing rider details
        const updateStmt = db.prepare("UPDATE riders SET username = ?, pickup_location = ?, dropoff_location = ?, driver_id = ? WHERE phone_number = ?");
        updateStmt.run(username, pickupLocation, dropoffLocation, driverId, phoneNumber, (err) => {
          if (err) {
            console.error("Error updating rider:", err);
          } else {
            console.log(`Rider with phone number ${phoneNumber} updated.`);
          }
        });
        updateStmt.finalize();
      } else {
        // Insert a new rider
        const insertStmt = db.prepare("INSERT INTO riders (username, phone_number, pickup_location, dropoff_location, driver_id) VALUES (?, ?, ?, ?, ?)");
        insertStmt.run(username, phoneNumber, pickupLocation, dropoffLocation, driverId, function (err) {
          if (err) {
            console.error("Error inserting rider:", err);
          } else {
            console.log(`Rider added with ID ${this.lastID}`);
          }
        });
        insertStmt.finalize();
      }
    });
  });
}




// Export functions for use elsewhere
module.exports = {
  addDriver,
  addRider
};
