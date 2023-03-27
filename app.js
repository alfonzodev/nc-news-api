const { getTopics } = require("./controllers/news.controllers.js");
const { errorHandler } = require("./controllers/errors.controllers.js");
const express = require("express");

const app = express();

app.get("/api/topics", getTopics);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not found!" });
});

app.use(errorHandler);

module.exports = app;
