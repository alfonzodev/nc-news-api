const { fetchUsers, fetchUserByUsername } = require("../models/users.models.js");

const getUsers = (req, res, next) => {
  fetchUsers()
    .then((data) => {
      const users = data.rows;
      res.status(200).send({ users });
    })
    .catch((err) => next(err));
};

const getUserByUsername = (req, res, next) => {
  const {username} = req.params;
  fetchUserByUsername(username)
    .then((data) => {
      const user = data.rows[0];
      res.status(200).send({ user });
    })
    .catch((err) => next(err));
};

module.exports = { getUsers, getUserByUsername };
