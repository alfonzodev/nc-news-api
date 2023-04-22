const usersRouter = require("express").Router();

const {getUsers, registerUser, getUserByUsername, loginUser} = require('../controllers/users.controllers.js');

const { protect } =  require("../middleware/auth.middleware.js");

usersRouter.get("/", getUsers);
usersRouter.get("/:username", protect, getUserByUsername);
usersRouter.post("/register", registerUser);
usersRouter.post("/login", loginUser);

module.exports = usersRouter;
