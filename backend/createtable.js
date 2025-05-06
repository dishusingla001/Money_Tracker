const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config(); // optional if you're using .env

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(__dirname + '/ca.pem')
  }
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
  );
`;

connection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('❌ Error creating users table:', err.message);
  } else {
    console.log('✅ Users table created or already exists.');

    // Now let's fetch the users (you can change this to expenses if needed)
    connection.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('❌ Error fetching users:', err.message);
      } else {
        if (results.length === 0) {
          console.log('ℹ️ No users found. The table is empty.');
        } else {
          console.log('👥 Users:');
          console.table(results);
        }
      }

      // End the connection
      connection.end();
    });
  }
});