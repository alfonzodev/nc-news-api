const {
  fetchTopics,
  fetchArticles,
  fetchArticlebyId,
  fetchCommentsByArticle,
  insertComment,
  updateArticleVoteCount,
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

  insertComment(article_id, comment)
    .then((data) => {
      const comment = data.rows[0];
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const patchVoteCount = (req, res, next) => {
  const { article_id } = req.params;
  const incrementVote = req.body;
  updateArticleVoteCount(article_id, incrementVote)
    .then((data) => {
      const updatedArticle = data.rows[0];
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getTopics,
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postComment,
  patchVoteCount,
};
