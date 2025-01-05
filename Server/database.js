

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

  // Create queue table
  db.run(`
    CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (rider_id) REFERENCES riders(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );
  `);
});

console.log("Database and tables are ready.");

function addDriver(username, phoneNumber, queueLength = 0, uuid, drivers) {
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

            // Update the drivers object with the existing driver's details
            drivers[uuid] = {
              type: 'driver',
              id: row.id,
              username: username,  // Use the updated username
              phone_number: phoneNumber,
              queue_length: row.queue_length // Leave the queue length unchanged
            };
            console.log(drivers[uuid]);
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

            // Add the new driver to the drivers object after insertion
            drivers[uuid] = {
              type: 'driver',
              id: this.lastID, // Use the newly inserted driver's ID
              username: username,
              phone_number: phoneNumber,
              queue_length: queueLength
            };
            console.log(drivers[uuid]);
          }
        });
        insertStmt.finalize();
      }
    });
  });
}


function addRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId = null, uuid, riders) {
  db.serialize(() => {
    db.get("SELECT * FROM riders WHERE phone_number = ?", [phoneNumber], (err, row) => {
      if (err) {
        console.error("Error querying riders table:", err);
        return;
      }

      if (row) {
        // Update existing rider details
        const updateStmt = db.prepare("UPDATE riders SET username = ?, pickup_location = ?, dropoff_location = ? WHERE phone_number = ?");
        updateStmt.run(username, pickupLocation, dropoffLocation, phoneNumber, (err) => {
          if (err) {
            console.error("Error updating rider:", err);
          } else {
            console.log(`Rider with phone number ${phoneNumber} updated.`);

            riders[uuid] = {
              type: 'rider',
              id: row.id,
              username: username,
              phoneNumber: phoneNumber,
              pickupLocation: pickupLocation,
              dropoffLocation: dropoffLocation,
              driverId: row.driver_id,
            }
            
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
            console.log(`Rider added to database with ID: ${this.lastID}`);
            riders[uuid] = {
              type: 'rider',
              id: this.lastID,
              username: username, 
              phoneNumber: phoneNumber,
              pickupLocation: pickupLocation,
              dropoffLocation: dropoffLocation,
              driverId: driverId
            }
          }
        });
        insertStmt.finalize();
      }
    });
  });
}

/**
 * 
 * @param {*} riderId // database id of rider being added
 * @param {*} driverId // database id of driver being added
 * @param {*} callback // prevents crashing if adding is unsuccessful
 */
function addQueue(riderId, driverId, callback = () => {}) {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Failed to start transaction:', err);
        callback(err);
        return;
      }

      // Find the driver by ID
      db.get('SELECT * FROM drivers WHERE id = ?', [driverId], (err, driver) => {
        if (err) {
          console.error('Error fetching driver:', err);
          db.run('ROLLBACK', () => console.error('Transaction rolled back due to driver fetch error.'));
          callback(err);
          return;
        }

        if (!driver) {
          console.error('Driver not found.');
          db.run('ROLLBACK', () => console.error('Transaction rolled back: Driver not found.'));
          callback(new Error('Driver not found'));
          return;
        }

        // Find the rider by ID
        db.get('SELECT * FROM riders WHERE id = ?', [riderId], (err, rider) => {
          if (err) {
            console.error('Error fetching rider:', err);
            db.run('ROLLBACK', () => console.error('Transaction rolled back due to rider fetch error.'));
            callback(err);
            return;
          }

          if (!rider) {
            console.error('Rider not found.');
            db.run('ROLLBACK', () => console.error('Transaction rolled back: Rider not found.'));
            callback(new Error('Rider not found'));
            return;
          }

          // Update the rider's driver_id
          db.run('UPDATE riders SET driver_id = ? WHERE id = ?', [driver.id, riderId], (err) => {
            if (err) {
              console.error('Error updating rider:', err);
              db.run('ROLLBACK', () => console.error('Transaction rolled back due to rider update error.'));
              callback(err);
              return;
            }

            // Insert into queue table
            const insertStmt = db.prepare(`
              INSERT INTO queue (rider_id, driver_id) 
              VALUES (?, ?)
            `);
            insertStmt.run(riderId, driverId, function (err) {
              if (err) {
                console.error('Error inserting into queue:', err);
                db.run('ROLLBACK', () => console.error('Transaction rolled back due to queue insert error.'));
                callback(err);
                return;
              }

              const queueId = this.lastID; // Get the newly created queue ID

              // Update the driver's queue length
              db.get('SELECT COUNT(*) AS queueLength FROM riders WHERE driver_id = ?', [driver.id], (err, row) => {
                if (err) {
                  console.error('Error fetching rider count for driver queue length:', err);
                  db.run('ROLLBACK', () => console.error('Transaction rolled back due to queue length fetch error.'));
                  callback(err);
                  return;
                }

                const queueLength = row ? row.queueLength : 0; // Default to 0 if no riders are found
                db.run('UPDATE drivers SET queue_length = ? WHERE id = ?', [queueLength, driver.id], (updateErr) => {
                  if (updateErr) {
                    console.error('Error updating driver queue length:', updateErr);
                    db.run('ROLLBACK', () => console.error('Transaction rolled back due to driver update error.'));
                    callback(updateErr);
                  } else {
                    // Commit the transaction if all steps succeed
                    db.run('COMMIT', (commitErr) => {
                      if (commitErr) {
                        console.error('Failed to commit transaction:', commitErr);
                        callback(commitErr);
                      } else {
                        console.log(`Driver ${driver.username}'s queue length updated to ${queueLength}`);
                        callback(null, { riderId, driverId, queueId }); // Return the queue ID
                      }
                    });
                  }
                });
              });

              insertStmt.finalize();
            });
          });
        });
      });
    });
  });
}


/**
 * 
 * @param {*} riderId // database id of rider
 * @param {*} driverId // database id of driver
 * @param {*} callback // prevents crashing if adding is unsuccessful
 */

function updateQueueEndTime(riderId, driverId, callback = () => {}) {
  const endTime = new Date().toISOString(); // Current timestamp
  db.serialize(() => {
    const updateStmt = db.prepare(`
      UPDATE queue SET ended_at = ? WHERE rider_id = ? AND driver_id = ?
    `);
    updateStmt.run(endTime, riderId, driverId, (err) => {
      if (err) {
        console.error("Error updating queue end time:", err);
        callback(err);
      } else {
        console.log(`Queue entry for rider ID: ${riderId} and driver ID: ${driverId} marked as ended.`);
        callback(null);
      }
    });
    updateStmt.finalize();
  });
}


/**
 * 
 * @param {*} queueId // database id of queue being ended
 * @param {*} callback // prevents crashing if adding is unsuccessful
 */

function updateQueueEndTime(queueId, callback = () => {}) {
  const endTime = new Date().toISOString(); // Current timestamp
  db.serialize(() => {
    const updateStmt = db.prepare(`
      UPDATE queue SET ended_at = ? WHERE id = ?
    `);
    updateStmt.run(endTime, queueId, (err) => {
      if (err) {
        console.error("Error updating queue end time:", err);
        callback(err);
      } else {
        console.log(`Queue entry ${queueId} marked as ended.`);
        callback(null);
      }
    });
    updateStmt.finalize();
  });
}

function getQueuesForDriver(driverId, callback) {
  db.serialize(() => {
    const query = `
      SELECT 
        q.id AS queue_id,
        q.created_at,
        r.id AS rider_id,
        r.username,
        r.phone_number,
        r.pickup_location,
        r.dropoff_location
      FROM queue q
      INNER JOIN riders r ON q.rider_id = r.id
      WHERE q.driver_id = ? AND q.ended_at IS NULL
      ORDER BY q.created_at ASC
    `;

    console.log("Fetching queues for driverId:", driverId);
    db.all(query, [Number(driverId)], (err, rows) => {
      console.log("Database rows:", rows); // Log the result from the database
      if (err) {
        console.error("Error retrieving queue with riders:", err);
        callback(err, null);
      } else {
        console.log("Retrieved queue with riders:", rows);
        callback(null, rows);
      }
    });
  });
}



// Function to get driver by ID
function getQueueByRiderId(riderId, callback) {
  db.get('SELECT * FROM queue WHERE rider_id = ? AND ended_at IS NULL', [riderId], (err, row) => {
    if (err) {
      console.error('Error fetching queue:', err);
      callback(err, null);
      return;
    }
    callback(null, row);
  });
}

// Function to get driver by ID
function getDriverByPhoneNumber(driverPhoneNumber, callback) {
  db.get('SELECT * FROM drivers WHERE phone_number = ?', [driverPhoneNumber], (err, row) => {
    if (err) {
      console.error('Error fetching driver:', err);
      callback(err, null);
      return;
    }
    callback(null, row);
  });
}

// Function to get rider by ID
function getRiderByPhoneNumber(riderPhoneNumber, callback) {
  db.get('SELECT * FROM riders WHERE phone_number = ?', [riderPhoneNumber], (err, row) => {
    if (err) {
      console.error('Error fetching rider:', err);
      callback(err, null);
      return;
    }
    callback(null, row);
  });
}



// Export functions for use elsewhere
module.exports = {
  addDriver,
  addRider,
  addQueue,
  updateQueueEndTime,
  getDriverByPhoneNumber,
  getRiderByPhoneNumber,
  getQueueByRiderId,
  getQueuesForDriver
};
