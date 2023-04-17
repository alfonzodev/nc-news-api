const db = require("../db/connection.js");
const format = require("pg-format");

const checkExists = (table, col, value) => {
  // %I is an identifier in pg-format
  const query = format("SELECT * FROM %I WHERE %I = $1", table, col);
  return db.query(query, [value]).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `Not Found: ${col} does not exist.`,
      });
    }
    return result.rows[0];
  });
};


module.exports = { checkExists};
