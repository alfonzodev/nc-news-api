const usersRouter = require("express").Router();

const {getUsers, registerUser, getUserByUsername, loginUser, logoutUser} = require('../controllers/users.controllers.js');

const { protect } =  require("../middleware/auth.middleware.js");

usersRouter.get("/", getUsers);
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);
usersRouter.get("/logout", logoutUser);
usersRouter.get("/:username", protect, getUserByUsername);

module.exports = usersRouter;
