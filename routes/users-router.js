const usersRouter = require("express").Router();

const {getUsers, registerUser, getUserByUsername} = require('../controllers/users.controllers.js');

usersRouter.get("/", getUsers);
usersRouter.get("/:username", getUserByUsername);
usersRouter.post("/register", registerUser);

module.exports = usersRouter;
