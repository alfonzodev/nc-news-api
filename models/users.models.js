const db = require("../db/connection.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const fetchUsers = () => {
  return db.query(
    `SELECT
        users.username,
        users.name,
        users.email,
        users.avatar_id,
        avatars.avatar_img_url AS avatar_img_url
     FROM users
     LEFT JOIN avatars ON users.avatar_id = avatars.avatar_id`
  );
};

const fetchUserByUsername = (username) => {
  return db
    .query(
      `SELECT
         users.username,
         users.name,
         users.email,
         users.avatar_id,
         avatars.avatar_img_url AS avatar_img_url
       FROM users
       LEFT JOIN avatars ON users.avatar_id = avatars.avatar_id
       WHERE users.username = $1`,
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

const createUser = async ({ username, name, email, password, avatar_id }) => {
  if (!password) return Promise.reject({ status: 400, msg: "Error: missing information." });

  // Hash Password
  let hashedPwd = await bcrypt.hash(password, 10);

  const queryParams = [username, name, email, hashedPwd, avatar_id];

  let queryStr = `
    WITH inserted_user AS (
      INSERT INTO users (username, name, email, password, avatar_id)
      VALUES ($1, $2, $3, $4, COALESCE($5, 1 )) -- Use COALESCE to handle optional avatar_id
      RETURNING username, name, email, avatar_id
    )
    SELECT
      inserted_user.username,
      inserted_user.name,
      inserted_user.email,
      inserted_user.avatar_id,
      avatars.avatar_img_url
    FROM inserted_user
    LEFT JOIN avatars ON inserted_user.avatar_id = avatars.avatar_id;
  `;

  const response = await db.query(queryStr, queryParams);
  const user = response.rows[0];

  // Generate an access token with 1d of expiration
  const accessToken = jwt.sign({ username }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  return { user, accessToken };
};

const authenticateUser = async ({ email, password }) => {
  if (!email || !password) {
    return Promise.reject({
      status: 400,
      msg: "Error: please provide email and password.",
    });
  }

  const selectUserResponse = await db.query(
    `
    SELECT 
      users.username, 
      users.name, 
      users.email, 
      users.password, 
      users.avatar_id,
      avatars.avatar_img_url
    FROM users
    LEFT JOIN avatars on users.avatar_id = avatars.avatar_id
    WHERE email = $1;
    `,
    [email]
  );

  // Check for empty response
  if (selectUserResponse.rowCount === 0) {
    return Promise.reject({
      status: 404,
      msg: "Not Found: email does not exist.",
    });
  }

  const user = selectUserResponse.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    const username = user.username;

    // Generate an access token with 1d of expiration
    const accessToken = jwt.sign({ username }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    delete user.password;
    return { user, accessToken };
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
