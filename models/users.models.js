const db = require("../db/connection.js");

const fetchUsers = () => {
  return db.query("SELECT * FROM users");
};

const fetchUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then((data) => {
      if (data.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found: username does not exist.",
        });
      } else {
        return data;
      }
    });
};

module.exports = { fetchUsers, fetchUserByUsername };
