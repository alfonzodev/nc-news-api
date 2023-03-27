const {
  fetchTopics,
  fetchArticles,
  fetchArticlebyId,
} = require("../models/news.models.js");

const getTopics = (req, res, next) => {
  fetchTopics()
    .then((data) => {
      const topics = data.rows;
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
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
  fetchArticles().then((data) => {
    const articles = data.rows;
    res.status(200).send({ articles });
  });
};

module.exports = { getTopics, getArticles, getArticleById };
