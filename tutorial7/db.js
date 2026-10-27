// db.js -- one shared connection pool to MySQL 
const mysql = require('mysql2/promise'); 

const pool = mysql.createPool({ 
  host: 'localhost', 
  user: 'root', 
  password: 'root123', // <-- Replace with your MySQL root password
  database: 'gqldemo', 
}); 

module.exports = pool;