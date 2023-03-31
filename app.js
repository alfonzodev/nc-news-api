const endpoints = require("./endpoints.json");
const {
  getTopics,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
  patchVoteCount,
  deleteComment,
} = require("./controllers/news.controllers.js");

const { getUsers } = require("./controllers/users.controllers.js");
const {
  errorHandlerCustom,
  psqlErrorHandler,
  errorHandler500Status,
} = require("./controllers/errors.controllers.js");
const express = require("express");

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/users", getUsers);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.patch("/api/articles/:article_id", patchVoteCount);

app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not found!" });
});

app.use(errorHandlerCustom);
app.use(psqlErrorHandler);
app.use(errorHandler500Status);

module.exports = app;
