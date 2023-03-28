const {
  fetchTopics,
  fetchArticles,
  fetchArticlebyId,
  fetchCommentsByArticle,
  insertComment,
} = require("../models/news.models.js");

const { checkExists } = require("../models/utils.models.js");

const getTopics = (req, res, next) => {
  fetchTopics()
    .then((data) => {
      const topics = data.rows;
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticlebyId(article_id)
    .then((data) => {
      const article = data.rows[0];
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

const getArticles = (req, res, next) => {
  fetchArticles()
    .then((data) => {
      const articles = data.rows;
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
};

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([
    checkExists("articles", "article_id", article_id),
    fetchCommentsByArticle(article_id),
  ])
    .then((promisesResult) => {
      const comments = promisesResult[1].rows;
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

const postComment = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;

  if (!comment.hasOwnProperty("username") || !comment.hasOwnProperty("body")) {
    next({ status: 400, msg: "Error: missing information." });
  } else if (comment.body === "") {
    next({ status: 400, msg: "Error: empty comment." });
  }

  Promise.all([
    checkExists("articles", "article_id", article_id),
    checkExists("users", "username", comment.username),
  ])
    .then(() => {
      return insertComment(article_id, comment);
    })
    .then((data) => {
      const comment = data.rows[0];
      res.status(201).send({ comment });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

module.exports = {
  getTopics,
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postComment,
};
