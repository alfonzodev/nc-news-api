const db = require("../db/connection.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const fetchUsers = () => {
  return db.query("SELECT username, name, email, avatar_url FROM users");
};

const fetchUserByUsername = (username) => {
  return db
    .query(
      "SELECT username, name, email, avatar_url FROM users WHERE username = $1",
      [username]
    )
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

const createUser = async ({ username, name, email, password, avatar_url }) => {
  const queryParams = [username, name, email, avatar_url];
  let queryStr =
    "INSERT INTO users(username, name, email, avatar_url, password) VALUES($1, $2, $3, $4, $5) RETURNING username, name, email, avatar_url";
  if (password) {
    const hashedPwd = await bcrypt.hash(password, 10);
    queryParams.push(hashedPwd);
  } else {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  }

  return db.query(queryStr, queryParams);
};

const authenticateUser = async ({ email, password }) => {
  if (!email || !password) {
    return Promise.reject({
      status: 400,
      msg: "Error: please provide email and password.",
    });
  }

  const findUser = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (findUser.rowCount === 0) {
    return Promise.reject({
      status: 404,
      msg: "Not Found: email does not exist.",
    });
  }
  const user = findUser.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    const username = user.username;

    // Generate an access token with 15min of expiration
    const accessToken = jwt.sign(
      { username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 15 * 60 }
    );

    // Generate a refresh token with 5d of expiration
    const refreshToken = jwt.sign(
      { username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "5d" }
    );

    // Add refreshToken to jwt table(non-existing yet) in corresponding username row
    // this will allow for logout functionality in the future

    return {accessToken, refreshToken};
  } else {
    return Promise.reject({
      status: 401,
      msg: "Error: password does not match.",
    });
  }
};

module.exports = {
  fetchUsers,
  fetchUserByUsername,
  createUser,
  authenticateUser,
};
