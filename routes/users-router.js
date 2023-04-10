const usersRouter = require("express").Router();

const {getUsers, postUser, getUserByUsername} = require('../controllers/users.controllers.js');

usersRouter.get("/", getUsers).post("/", postUser);
usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
