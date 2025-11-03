import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

console.log("Loaded MySQL env:", process.env.MYSQLHOST);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  connectTimeout: 10000
});

export default pool;
