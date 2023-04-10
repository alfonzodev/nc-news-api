const db = require("../db/connection.js");
const bcrypt = require('bcrypt');

const fetchUsers = () => {
  return db.query("SELECT username, name, email, avatar_url FROM users");
};

const fetchUserByUsername = (username) => {
  return db
    .query("SELECT username, name, email, avatar_url FROM users WHERE username = $1", [username])
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

const registerUser = async ({username, name, email, password, avatar_url }) => {
  const queryParams = [username, name, email, avatar_url];
  let queryStr = 'INSERT INTO users(username, name, email, avatar_url, password) VALUES($1, $2, $3, $4, $5) RETURNING username, name, email, avatar_url';
  if(password){
    const hashedPwd = await bcrypt.hash(password, 10);
    queryParams.push(hashedPwd);
  }else{
    return Promise.reject({status: 400, msg: "Error: missing information."})
  }
  
  return db.query(queryStr, queryParams);
}

module.exports = { fetchUsers, fetchUserByUsername, registerUser };
