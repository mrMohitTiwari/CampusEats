// db.js -- MySQL Connection Pool
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root123', // <-- Your MySQL root password
  database: 'campuseats',
});

module.exports = pool;