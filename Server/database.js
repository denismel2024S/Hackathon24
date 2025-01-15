

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

  // // Create queue table
  // db.run(`
  //   CREATE TABLE IF NOT EXISTS queue (
  //   id INTEGER PRIMARY KEY AUTOINCREMENT,
  //   rider_id INTEGER NOT NULL,
  //   driver_id INTEGER NOT NULL,
  //   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  //   ended_at DATETIME,
  //   FOREIGN KEY (rider_id) REFERENCES riders(id),
  //   FOREIGN KEY (driver_id) REFERENCES drivers(id)
  //   );
  // `);

  // TEST QUEUE DATABASE

  // Create queue table with status column
db.run(`
  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    status TEXT DEFAULT 'In queue', -- Add status column with a default value
    FOREIGN KEY (rider_id) REFERENCES riders(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
  );
`);

// END TEST QUEUE DATABASE

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



function addOrUpdateDriver(username, phoneNumber, queueLength = 0, uuid, drivers, callback) {
  db.serialize(() => {
    // Check if a driver with the given phone number exists
    db.get("SELECT * FROM drivers WHERE phone_number = ?", [phoneNumber], (err, row) => {
      if (err) {
        console.error("Error querying drivers table:", err);
        callback(err, null); // Return error via callback
        return;
      }

      if (row) {
        // Update the username of the existing driver
        const updateStmt = db.prepare("UPDATE drivers SET username = ? WHERE phone_number = ?");
        updateStmt.run(username, phoneNumber, (updateErr) => {
          if (updateErr) {
            console.error("Error updating driver:", updateErr);
            callback(updateErr, null); // Return error via callback
          } else {
            console.log(`Driver with phone number ${phoneNumber} updated.`);

            // Prepare the updated driver object
            const updatedDriver = {
              type: 'driver',
              id: row.id,
              username: username, // Updated username
              phone_number: phoneNumber,
              queue_length: row.queue_length // Queue length remains unchanged
            };

            // Update the drivers object
            drivers[uuid] = updatedDriver;

            console.log(updatedDriver);
            callback(null, updatedDriver); // Return the updated driver object
          }
        });
        updateStmt.finalize();
      } else {
        // Insert a new driver if no match is found
        const insertStmt = db.prepare("INSERT INTO drivers (username, phone_number, queue_length) VALUES (?, ?, ?)");
        insertStmt.run(username, phoneNumber, queueLength, function (insertErr) {
          if (insertErr) {
            console.error("Error inserting driver:", insertErr);
            callback(insertErr, null); // Return error via callback
          } else {
            console.log(`Driver added with ID ${this.lastID}`);

            // Prepare the newly created driver object
            const newDriver = {
              type: 'driver',
              id: this.lastID, // Use the last inserted ID
              username: username,
              phone_number: phoneNumber,
              queue_length: queueLength
            };

            // Add the new driver to the drivers object
            drivers[uuid] = newDriver;

            console.log(newDriver);
            callback(null, newDriver); // Return the newly created driver object
          }
        });
        insertStmt.finalize();
      }
    });
  });
}

function addOrUpdateRider(username, phoneNumber, pickupLocation, dropoffLocation, driverId = null, uuid, riders, callback) {
  db.serialize(() => {
    // Check if a rider with the given phone number exists
    db.get("SELECT * FROM riders WHERE phone_number = ?", [phoneNumber], (err, row) => {
      if (err) {
        console.error("Error querying riders table:", err);
        callback(err, null); // Return error via callback
        return;
      }

      if (row) {
        // Update the existing rider's details
        const updateStmt = db.prepare(`
          UPDATE riders 
          SET username = ?, pickup_location = ?, dropoff_location = ? 
          WHERE phone_number = ?
        `);
        updateStmt.run(username, pickupLocation, dropoffLocation, phoneNumber, (updateErr) => {
          if (updateErr) {
            console.error("Error updating rider:", updateErr);
            callback(updateErr, null); // Return error via callback
          } else {
            console.log(`Rider with phone number ${phoneNumber} updated.`);

            console.log(row)

            // Prepare the updated rider object
            const updatedRider = {
              type: 'rider',
              id: row.id,
              username: username, // Updated username
              phone_number: phoneNumber,
              pickup_location: pickupLocation,
              dropoff_location: dropoffLocation,
              driver_id: row.driver_id, // Updated driver ID
            };

            // Update the riders object
            riders[uuid] = updatedRider;

            console.log(updatedRider);
            callback(null, updatedRider); // Return the updated rider object
          }
        });
        updateStmt.finalize();
      } else {
        // Insert a new rider if no match is found
        const insertStmt = db.prepare(`
          INSERT INTO riders (username, phone_number, pickup_location, dropoff_location, driver_id) 
          VALUES (?, ?, ?, ?, ?)
        `);
        insertStmt.run(username, phoneNumber, pickupLocation, dropoffLocation, driverId, function (insertErr) {
          if (insertErr) {
            console.error("Error inserting rider:", insertErr);
            callback(insertErr, null); // Return error via callback
          } else {
            console.log(`Rider added to database with ID: ${this.lastID}`);

            // Prepare the newly created rider object
            const newRider = {
              type: 'rider',
              id: this.lastID, // Use the last inserted ID
              username: username,
              phone_number: phoneNumber,
              pickup_location: pickupLocation,
              dropoff_location: dropoffLocation,
              driver_id: driverId,
            };

            // Add the new rider to the riders object
            riders[uuid] = newRider;

            console.log(newRider);
            callback(null, newRider); // Return the newly created rider object
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
 * Updates the queue with an ended_at time and resets the rider's driver_id to NULL.
 *
 * @param {*} riderId // Database ID of the rider
 * @param {*} queueId // Database ID of the queue entry
 * @param {*} callback // Prevents crashing if the update is unsuccessful
 */
function updateQueueAndResetDriver(riderId, queueId, callback = () => {}) {
  const endTime = new Date().toISOString(); // Current timestamp

  db.serialize(() => {
    // Update the queue's ended_at time
    const updateQueueStmt = db.prepare(`
      UPDATE queue
      SET ended_at = ?, status = ?
      WHERE id = ?
      RETURNING id AS queue_id, created_at, ended_at, status, rider_id, driver_id
    `);
  
    updateQueueStmt.get([endTime, "terminated", queueId], (err) => {
      if (err) {
        console.error("Error updating queue end time:", err);
        callback(err);
        return;
      }

      console.log(`Queue entry with ID: ${queueId} marked as ended.`);

      // Reset the rider's driver_id to NULL
      const resetDriverStmt = db.prepare(`
        UPDATE riders 
        SET driver_id = NULL 
        WHERE id = ?
      `);

      resetDriverStmt.run(riderId, (err) => {
        if (err) {
          console.error("Error resetting rider's driver_id:", err);
          callback(err);
        } else {
          console.log(`Rider ID: ${riderId} driver_id set to NULL.`);
          callback(null);
        }
      });

      resetDriverStmt.finalize();
    });

    updateQueueStmt.finalize();
  });
}

/**
 * Update the status of a queue entry and return the updated queue object.
 * 
 * @param {*} riderId - The ID of the rider.
 * @param {*} driverId - The ID of the driver.
 * @param {*} status - The new status to set.
 * @param {*} callback - Callback to handle the result (err, queue).
 */
function updateQueueStatus(riderId, driverId, status, callback = () => {}) {
  db.serialize(() => {
    const updateStmt = db.prepare(`
      UPDATE queue
      SET status = ?
      WHERE rider_id = ? AND driver_id = ?
      RETURNING id AS queue_id, created_at, status, rider_id, driver_id
    `);

    updateStmt.get([status, riderId, driverId], (err, row) => {
      if (err) {
        console.error("Error updating queue status:", err);
        callback(err, null);
      } else {
        console.log("Queue status updated successfully:", row);
        callback(null, row); // Return the updated queue object
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
        q.status,
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
      if (err) {
        console.error("Error retrieving queue with riders:", err);
        callback(err, null);
      } else {
        console.log("Retrieved queue with riders and statuses:", rows);

        // Count the number of rows returned
        const queueLength = rows.length;

        // Update the queue_length in the drivers table
        const updateQuery = `
          UPDATE drivers
          SET queue_length = ?
          WHERE id = ?
        `;

        db.run(updateQuery, [queueLength, Number(driverId)], (updateErr) => {
          if (updateErr) {
            console.error("Error updating driver's queue length:", updateErr);
          } else {
            console.log(`Updated driver's queue length to ${queueLength}`);
          }

          // Proceed with the callback
          callback(null, rows);
        });
      }
    });
  });
}




// Function to get rider by ID
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

// Function to get driver by phone number
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


// Function to get driver by phone number
function getDriverById(driverId, callback) {
  db.get('SELECT * FROM drivers WHERE id = ?', [driverId], (err, row) => {
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

function clearDatabase(){
  const tables = ['drivers', 'riders', 'queue']
  db.serialize(() => {
    tables.forEach((table) => {
      db.run(`DELETE FROM ${table}`, (err) => {
        if (err){
          console.log(`Error clearing ${table} table: `, err)
        }else{
          console.log(`All rows deleted ${table}`)
        }
      })
    })
  })
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
  getQueuesForDriver,
  updateQueueAndResetDriver,
  updateQueueStatus, 
  addOrUpdateDriver, 
  addOrUpdateRider,
  getDriverById,
  clearDatabase
};
