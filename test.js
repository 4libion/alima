const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_NAME,
    connectionLimit : 100
});

var rows = [];

pool.query('SELECT * FROM customers', (error, results) => {
    if (error) throw error;
    const result = Object.values(JSON.parse(JSON.stringify(results)));
    // console.log(result);
});
console.log(rows.length)

result.forEach((variable) => {
    console.log(variable);
});