const {
  getTopics,
  getArticleById,
} = require("./controllers/news.controllers.js");
const {
  errorHandler,
  psqlErrorHandler,
} = require("./controllers/errors.controllers.js");
const express = require("express");

const app = express();

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not found!" });
});

app.use(errorHandler);
app.use(psqlErrorHandler);

module.exports = app;
