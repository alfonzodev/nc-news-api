const {
  fetchUsers,
  fetchUserByUsername,
  createUser,
  authenticateUser,
} = require("../models/users.models.js");

const getUsers = (req, res, next) => {
  fetchUsers()
    .then((data) => {
      const users = data.rows;
      res.status(200).send({ users });
    })
    .catch((err) => next(err));
};

const getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then((data) => {
      const user = data.rows[0];
      res.status(200).send({ user });
    })
    .catch((err) => next(err));
};

const registerUser = (req, res, next) => {
  const newUser = req.body;
  createUser(newUser)
    .then((data) => {
      const user = data.rows[0];
      res.status(201).send({ user });
    })
    .catch((err) => next(err));
};

const loginUser = (req, res, next) => {
  const userCredentials = req.body;
  authenticateUser(userCredentials)
    .then((accessToken) => {
      res
        .cookie("access_token", accessToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "none",
        })
        .status(200)
        .send({ accessToken });
    })
    .catch((err) => next(err));
};

module.exports = { getUsers, getUserByUsername, registerUser, loginUser };
