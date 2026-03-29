require("dotenv").config({ path: require("path").join(__dirname, ".env") })
const mysql = require("mysql2")

const db = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // FIX: port was missing — Clever Cloud uses a non-default port
    port:     process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
}).promise()

module.exports = db