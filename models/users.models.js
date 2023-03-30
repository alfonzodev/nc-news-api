const db = require("../db/connection.js");

const fetchUsers = () => {
  return db.query("SELECT * FROM users");
};

module.exports = { fetchUsers };
