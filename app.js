const {
  getTopics,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
  patchVoteCount,
  deleteComment
} = require("./controllers/news.controllers.js");
const {
  errorHandler,
  psqlErrorHandler,
} = require("./controllers/errors.controllers.js");
const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.patch("/api/articles/:article_id", patchVoteCount);

app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not found!" });
});

app.use(errorHandler);
app.use(psqlErrorHandler);

module.exports = app;
