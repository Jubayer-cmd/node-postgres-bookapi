const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "12345", // Replace with the actual password
  port: 5432,
  database: "booksdb",
});

module.exports = pool;
