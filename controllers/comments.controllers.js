const {
  fetchCommentsByArticle,
  insertComment,
  deleteCommentById,
  updateCommentVotes,
} = require("../models/comments.models.js");

const { checkExists } = require("../models/utils.models.js");

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const {limit = 10, p = 1} = req.query;
  Promise.all([
    checkExists("articles", "article_id", article_id),
    fetchCommentsByArticle(article_id, limit, p),
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

const deleteComment = (req, res, next) => {
  const username = req.username;
  const { comment_id } = req.params;
  deleteCommentById(comment_id, username)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

const patchCommentVotes = (req, res, next) => {
  const incVotes = req.body;
  const { comment_id } = req.params;
  updateCommentVotes(incVotes, comment_id)
    .then((data) => {
      const updatedComment = data.rows[0];
      res.status(200).send({ updatedComment });
    })
    .catch((err) => next(err));
};

module.exports = {
  getCommentsByArticleId,
  postComment,
  deleteComment,
  patchCommentVotes,
};
