const { fetchTopics, fetchArticlebyId } = require("../models/news.models.js");

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

  if (isNaN(article_id)) next({ status: 400, msg: "Invalid article id!" });

  fetchArticlebyId(article_id)
    .then((data) => {
      const article = data.rows[0];
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

module.exports = { getTopics, getArticleById };
