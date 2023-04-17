const usersRouter = require("express").Router();

const {getUsers, registerUser, getUserByUsername, loginUser} = require('../controllers/users.controllers.js');

usersRouter.get("/", getUsers);
usersRouter.get("/:username", getUserByUsername);
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);

module.exports = usersRouter;
