require('dotenv').config();
const mysql = require('mysql2');

const user_db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Add these configuration options:
    insecureAuth: true,
    flags: '-FOUND_ROWS',
    // Set SQL mode to disable ONLY_FULL_GROUP_BY
    initSql: "SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'"
});

user_db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1); // Exit the process if connection fails
    }
    console.log('✅ Connected to Aiven MySQL!');
    
    // Verify SQL mode is set correctly
    user_db.query("SELECT @@sql_mode", (err, results) => {
        if (err) {
            console.error('Error checking SQL mode:', err);
            return;
        }
        console.log('Current SQL mode:', results[0]['@@sql_mode']);
    });
});

module.exports = user_db;