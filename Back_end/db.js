const mysql = require("mysql2");

const {
    DB_HOST = "127.0.0.1",
    DB_PORT = "3306",
    DB_USER = "root",
    DB_PASSWORD = "",
    DB_NAME = "compass_lk"
} = process.env;

const db = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error(
            `MySQL connection failed for ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME} - ${err.code || err.message}`
        );
        return;
    }

    connection.release();
});

module.exports = db;
