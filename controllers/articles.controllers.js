const {
  fetchArticles,
  fetchArticlesByAuthor,
  fetchArticleById,
  updateArticleVotes,
  createArticle,
  deleteArticle,
} = require("../models/articles.models.js");

const { checkExists } = require("../models/utils.models.js");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((data) => {
      const article = data.rows[0];
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

const getArticles = (req, res, next) => {
  const {
    sort_by = "created_at",
    order = "desc",
    topic,
    limit = 10,
    p = 1,
  } = req.query;

  const articlesPromises = [fetchArticles(sort_by, order, topic, limit, p)];

  if (topic) articlesPromises.push(checkExists("topics", "slug", topic));

  Promise.all(articlesPromises)
    .then(([fetchArticlesResult]) => {
      const articles = fetchArticlesResult[0].rows;
      const articlesCount = fetchArticlesResult[1].rows[0].count;
      res.status(200).send({ articles, total_count: articlesCount });
    })
    .catch((err) => next(err));
};

const getArticlesByAuthor = (req, res, next) => {
  const author = req.username;
  fetchArticlesByAuthor(author)
    .then((data) => {
      res.status(200).send({ articles: data.rows });
    })
    .catch((err) => next(err));
};

const patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const incrementVote = req.body;
  updateArticleVotes(article_id, incrementVote)
    .then((data) => {
      const updatedArticle = data.rows[0];
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

const postArticle = (req, res, next) => {
  const newArticle = req.body;
  createArticle(newArticle)
    .then((data) => {
      const article = data.rows[0];
      res.status(201).send({ article });
    })
    .catch((err) => next(err));
};

const deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  deleteArticle(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => next(err));
};

module.exports = {
  getArticles,
  getArticleById,
  patchArticleVotes,
  postArticle,
  deleteArticleById,
  getArticlesByAuthor,
};
